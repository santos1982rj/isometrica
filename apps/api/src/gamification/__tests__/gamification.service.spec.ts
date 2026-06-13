import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from '../gamification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { ConfigService } from '@nestjs/config';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: any;
  let eventBus: any;

  const mockPrisma = {
    gamificationProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    achievement: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    mission: {
      upsert: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
  };

  const mockEventBus = {
    publish: vi.fn(),
  };

  const mockConfig = {};

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GamificationService(
      mockPrisma as any,
      mockEventBus as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('levelFromXp', () => {
    it('should return level 1 for 0 XP', () => {
      expect((service as any).levelFromXp(0)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect((service as any).levelFromXp(100)).toBe(2);
    });

    it('should return level 3 for 300 XP', () => {
      expect((service as any).levelFromXp(300)).toBe(3);
    });
  });

  describe('xpForLevel', () => {
    it('should return 300 for level 2', () => {
      // 100 * 2 * 3 / 2 = 300
      expect((service as any).xpForLevel(2)).toBe(300);
    });

    it('should return 600 for level 3', () => {
      // 100 * 3 * 4 / 2 = 600
      expect((service as any).xpForLevel(3)).toBe(600);
    });

    it('should return 1000 for level 4', () => {
      // 100 * 4 * 5 / 2 = 1000
      expect((service as any).xpForLevel(4)).toBe(1000);
    });
  });

  describe('ensureProfile', () => {
    it('should create profile if not exists', async () => {
      const mockProfile = { id: '1', userId: 'user-1', xp: 0, level: 1, streak: 0 };
      mockPrisma.gamificationProfile.upsert.mockResolvedValue(mockProfile);

      const result = await service.ensureProfile('user-1');
      expect(result).toEqual(mockProfile);
      expect(mockPrisma.gamificationProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: {},
        create: { userId: 'user-1', xp: 0, level: 1, streak: 0 },
      });
    });
  });

  describe('addXp', () => {
    it('should add XP and update level', async () => {
      const mockProfile = { id: '1', userId: 'user-1', xp: 50, level: 1 };
      const mockUpdated = { id: '1', userId: 'user-1', xp: 60, level: 1 };

      mockPrisma.gamificationProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.gamificationProfile.update.mockResolvedValue(mockUpdated);

      vi.spyOn(service, 'ensureProfile').mockResolvedValue(mockProfile as any);

      const result = await service.addXp('user-1', 10);
      expect(result).toEqual(mockUpdated);
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should trigger level up event when crossing threshold', async () => {
      const mockProfile = { id: '1', userId: 'user-1', xp: 95, level: 1 };
      const mockUpdated = { id: '1', userId: 'user-1', xp: 105, level: 2 };

      mockPrisma.gamificationProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.gamificationProfile.update.mockResolvedValue(mockUpdated);

      vi.spyOn(service, 'ensureProfile').mockResolvedValue(mockProfile as any);

      await service.addXp('user-1', 10);

      expect(mockEventBus.publish).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateMission', () => {
    it('should upsert using compound unique on profileId+name, not id', async () => {
      const mockProfile = { id: 'profile-1', userId: 'user-1', xp: 0, level: 1, streak: 0 };
      mockPrisma.gamificationProfile.upsert.mockResolvedValue(mockProfile);
      vi.spyOn(service, 'ensureProfile').mockResolvedValue(mockProfile as any);

      mockPrisma.mission.upsert.mockResolvedValue({
        id: 'mission-1',
        gamificationProfileId: 'profile-1',
        name: 'responder-10-questoes',
        progress: 5,
        target: 10,
        completed: false,
      });

      const result = await service.updateMission('user-1', 'responder-10-questoes', 5, 10);

      expect(mockPrisma.mission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            gamificationProfileId_name: expect.objectContaining({
              gamificationProfileId: 'profile-1',
              name: 'responder-10-questoes',
            }),
          }),
        }),
      );
      expect(result.progress).toBe(5);
      expect(result.name).toBe('responder-10-questoes');
    });
  });

  describe('getLeaderboard', () => {
    it('does not select private user fields for student-visible leaderboard', async () => {
      mockPrisma.gamificationProfile.findMany.mockResolvedValue([]);

      await service.getLeaderboard(5);

      expect(mockPrisma.gamificationProfile.findMany).toHaveBeenCalledWith({
        orderBy: { xp: 'desc' },
        take: 5,
        include: { user: { select: { id: true, name: true, imageUrl: true, title: true } } },
      });
    });
  });

  describe('unlockAchievement', () => {
    it('does not create duplicate achievement with same name', async () => {
      const mockProfile = { id: 'profile-1', userId: 'user-1', xp: 0, level: 1, streak: 0 };
      mockPrisma.gamificationProfile.upsert.mockResolvedValue(mockProfile);
      mockPrisma.achievement.findFirst.mockResolvedValue({ id: 'existing', name: 'Duplicate' });

      const result = await service.unlockAchievement('user-1', 'Duplicate', 'Já existe', 'Star');

      expect(result).toEqual({ id: 'existing', name: 'Duplicate' });
      expect(mockPrisma.achievement.create).not.toHaveBeenCalled();
    });

    it('creates new achievement when no duplicate exists', async () => {
      const mockProfile = { id: 'profile-1', userId: 'user-1', xp: 0, level: 1, streak: 0 };
      mockPrisma.gamificationProfile.upsert.mockResolvedValue(mockProfile);
      mockPrisma.achievement.findFirst.mockResolvedValue(null);
      mockPrisma.achievement.create.mockResolvedValue({ id: 'new', name: 'Nova conquista' });

      const result = await service.unlockAchievement('user-1', 'Nova conquista', 'Descrição', 'Star');

      expect(result).toBeDefined();
      expect(mockPrisma.achievement.create).toHaveBeenCalled();
    });
  });

  describe('getXpHistory', () => {
    it('returns events ordered by createdAt desc', async () => {
      mockPrisma.event.findMany.mockResolvedValue([
        { id: 'e2', type: 'XP_GAINED', metadata: { amount: 10, total: 60 }, createdAt: new Date('2026-06-12T20:00:00Z') },
        { id: 'e1', type: 'XP_GAINED', metadata: { amount: 50, total: 50 }, createdAt: new Date('2026-06-12T19:00:00Z') },
      ]);

      const result = await service.getXpHistory('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].xp).toBe(10);
      expect(result[1].xp).toBe(50);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: 'XP_GAINED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('returns empty array when no XP events exist', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);

      const result = await service.getXpHistory('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getLeaderboard', () => {
    it('does not return email or passwordHash in user data', async () => {
      mockPrisma.gamificationProfile.findMany.mockResolvedValue([]);

      const result = await service.getLeaderboard(10);

      expect(mockPrisma.gamificationProfile.findMany).toHaveBeenCalledWith({
        orderBy: { xp: 'desc' },
        take: 10,
        include: { user: { select: { id: true, name: true, imageUrl: true, title: true } } },
      });
      // Verify these fields are NOT selected by checking any result
      const selectFields = (mockPrisma.gamificationProfile.findMany.mock.calls[0][0] as any).include.user.select;
      expect(selectFields.email).toBeUndefined();
      expect(selectFields.passwordHash).toBeUndefined();
      expect(selectFields.role).toBeUndefined();
    });
  });

  describe('updateStreak', () => {
    it('should increment streak', async () => {
      const mockProfile = { id: '1', userId: 'user-1', streak: 5 };
      const mockUpdated = { id: '1', userId: 'user-1', streak: 6 };

      mockPrisma.gamificationProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.gamificationProfile.update.mockResolvedValue(mockUpdated);

      vi.spyOn(service, 'ensureProfile').mockResolvedValue(mockProfile as any);

      const result = await service.updateStreak('user-1');
      expect(result?.streak).toBe(6);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'streak.updated',
          metadata: { streak: 6 },
        }),
      );
    });
  });
});
