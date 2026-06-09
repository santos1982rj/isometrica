import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { AppEvent, EventType } from '../interfaces/event.interface';
import { GamificationService } from '../../gamification/gamification.service';

@Injectable()
export class GamificationEventHandler {
  private readonly logger = new Logger(GamificationEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly gamification: GamificationService,
  ) {
    this.eventBus.registerHandler(EventType.QUESTION_ANSWERED, (event) => this.onQuestionAnswered(event));
    this.eventBus.registerHandler(EventType.LESSON_COMPLETED, (event) => this.onLessonCompleted(event));
    this.eventBus.registerHandler(EventType.STREAK_UPDATED, (event) => this.checkStreakAchievements(event));
  }

  private async onQuestionAnswered(event: AppEvent): Promise<void> {
    const correct = event.metadata?.correct as boolean;
    if (correct) {
      await this.gamification.addXp(event.userId, 10);
      this.logger.debug(`+10 XP for correct answer (user: ${event.userId})`);
    }
  }

  private async onLessonCompleted(event: AppEvent): Promise<void> {
    await this.gamification.addXp(event.userId, 50);
    await this.gamification.updateStreak(event.userId);
    this.logger.debug(`+50 XP + streak for lesson (user: ${event.userId})`);
  }

  private async checkStreakAchievements(event: AppEvent): Promise<void> {
    const profile = await this.gamification.getProfile(event.userId);
    if (!profile) return;

    if (profile.streak === 3) {
      await this.gamification.unlockAchievement(event.userId, 'Três dias seguidos', 'Complete aulas por 3 dias consecutivos', '🔥');
    }
    if (profile.streak === 7) {
      await this.gamification.unlockAchievement(event.userId, 'Maratonista', 'Complete aulas por 7 dias consecutivos', '🏃');
    }
    if (profile.streak === 30) {
      await this.gamification.unlockAchievement(event.userId, 'Lenda', 'Complete aulas por 30 dias consecutivos', '👑');
    }
  }
}
