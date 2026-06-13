import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { AppEvent, EventType } from '../interfaces/event.interface';
import { GamificationService } from '../../gamification/gamification.service';
import { CONFIG } from '../../common/config';

@Injectable()
export class GamificationEventHandler {
  private readonly logger = new Logger(GamificationEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly gamification: GamificationService,
  ) {
    this.eventBus.registerHandler(EventType.QUESTION_CORRECT, (event) => this.onQuestionAnswered(event));
    this.eventBus.registerHandler(EventType.QUESTION_INCORRECT, (event) => this.onQuestionAnswered(event));
    this.eventBus.registerHandler(EventType.LESSON_COMPLETED, (event) => this.onLessonCompleted(event));
    this.eventBus.registerHandler(EventType.STREAK_UPDATED, (event) => this.checkStreakAchievements(event));
    this.eventBus.registerHandler(EventType.SIMULADO_FINISHED, (event) => this.onSimuladoFinished(event));
  }

  private async onQuestionAnswered(event: AppEvent): Promise<void> {
    const correct = event.metadata?.correct as boolean;
    if (correct) {
      await this.gamification.addXp(event.userId, CONFIG.xp.question);
      await this.gamification.unlockAchievement(event.userId, 'Primeira resposta certa', 'Responda sua primeira questão corretamente', 'CheckCircle');
      this.logger.debug(`+10 XP for correct answer (user: ${event.userId})`);
    } else {
      this.logger.debug(`Incorrect answer recorded (user: ${event.userId})`);
    }
  }

  private async onLessonCompleted(event: AppEvent): Promise<void> {
    await this.gamification.addXp(event.userId, CONFIG.xp.lesson);
    await this.gamification.updateStreak(event.userId);
    await this.gamification.unlockAchievement(event.userId, 'Primeira aula', 'Complete sua primeira aula', 'Play');
    this.logger.debug(`+50 XP + streak for lesson (user: ${event.userId})`);
  }

  private async onSimuladoFinished(event: AppEvent): Promise<void> {
    await this.gamification.addXp(event.userId, 30);
    await this.gamification.unlockAchievement(event.userId, 'Primeiro simulado', 'Finalize seu primeiro simulado', 'FileCheck');
    this.logger.debug(`+30 XP for simulado (user: ${event.userId})`);
  }

  private async checkStreakAchievements(event: AppEvent): Promise<void> {
    const profile = await this.gamification.getProfile(event.userId);
    if (!profile) return;

    if (profile.streak === 3) {
      await this.gamification.unlockAchievement(event.userId, 'Três dias seguidos', 'Complete aulas por 3 dias consecutivos', 'Flame');
    }
    if (profile.streak === 7) {
      await this.gamification.unlockAchievement(event.userId, 'Maratonista', 'Complete aulas por 7 dias consecutivos', 'Trophy');
    }
    if (profile.streak === 30) {
      await this.gamification.unlockAchievement(event.userId, 'Lenda', 'Complete aulas por 30 dias consecutivos', 'Crown');
    }
  }
}
