import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { EventType } from '../event-bus/interfaces/event.interface';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  private xpForLevel(level: number): number {
    return 100 * level * (level + 1) / 2;
  }

  private levelFromXp(xp: number): number {
    let level = 1;
    while (this.xpForLevel(level) <= xp) level++;
    return level;
  }

  async ensureProfile(userId: string) {
    return this.prisma.gamificationProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, xp: 0, level: 1, streak: 0 },
    });
  }

  async getProfile(userId: string) {
    await this.ensureProfile(userId);
    return this.prisma.gamificationProfile.findUnique({
      where: { userId },
      include: {
        achievements: { orderBy: { unlockedAt: 'desc' } },
        missions: { where: { completed: false }, orderBy: { progress: 'desc' } },
      },
    });
  }

  async addXp(userId: string, amount: number) {
    await this.ensureProfile(userId);

    const profile = await this.prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    const oldLevel = profile.level;
    const newXp = profile.xp + amount;
    const newLevel = this.levelFromXp(newXp);

    const updated = await this.prisma.gamificationProfile.update({
      where: { userId },
      data: { xp: newXp, level: newLevel },
    });

    if (newLevel > oldLevel) {
      this.logger.log(`Level up! User ${userId} reached level ${newLevel}`);
      await this.eventBus.publish({
        type: EventType.LEVEL_UP,
        userId,
        timestamp: new Date(),
        metadata: { oldLevel, newLevel },
      });
    }

    await this.eventBus.publish({
      type: EventType.XP_GAINED,
      userId,
      timestamp: new Date(),
      metadata: { amount, total: newXp },
    });

    return updated;
  }

  async updateStreak(userId: string) {
    await this.ensureProfile(userId);
    const profile = await this.prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    const updated = await this.prisma.gamificationProfile.update({
      where: { userId },
      data: { streak: { increment: 1 } },
    });

    await this.eventBus.publish({
      type: EventType.STREAK_UPDATED,
      userId,
      timestamp: new Date(),
      metadata: { streak: updated.streak },
    });

    return updated;
  }

  async unlockAchievement(userId: string, name: string, description?: string, icon?: string) {
    const profile = await this.ensureProfile(userId);

    const existing = await this.prisma.achievement.findFirst({
      where: { gamificationProfileId: profile.id, name },
    });
    if (existing) return existing;

    const achievement = await this.prisma.achievement.create({
      data: {
        gamificationProfileId: profile.id,
        name,
        description,
        icon,
      },
    });

    await this.eventBus.publish({
      type: EventType.ACHIEVEMENT_UNLOCKED,
      userId,
      timestamp: new Date(),
      metadata: { achievement: name, icon },
    });

    return achievement;
  }

  async updateMission(userId: string, missionName: string, progress: number, target: number) {
    const profile = await this.ensureProfile(userId);

    const mission = await this.prisma.mission.upsert({
      where: { gamificationProfileId_name: { gamificationProfileId: profile.id, name: missionName } },
      create: { gamificationProfileId: profile.id, name: missionName, progress, target },
      update: { progress: Math.min(progress, target), completed: progress >= target },
    });

    return mission;
  }

  async getLeaderboard(limit = 10) {
    return this.prisma.gamificationProfile.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    });
  }
}
