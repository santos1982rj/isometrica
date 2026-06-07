import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { AppEvent, EventType } from '../interfaces/event.interface';

@Injectable()
export class GamificationEventHandler {
  private readonly logger = new Logger(GamificationEventHandler.name);

  constructor(private readonly eventBus: EventBusService) {
    this.eventBus.registerHandler(EventType.QUESTION_ANSWERED, (event) => this.onQuestionAnswered(event));
    this.eventBus.registerHandler(EventType.LESSON_COMPLETED, (event) => this.onLessonCompleted(event));
  }

  private async onQuestionAnswered(event: AppEvent): Promise<void> {
    const correct = event.metadata?.correct as boolean;
    if (correct) {
      this.logger.debug(`+10 XP for correct answer (user: ${event.userId})`);
    }
  }

  private async onLessonCompleted(event: AppEvent): Promise<void> {
    this.logger.debug(`+50 XP for lesson completion (user: ${event.userId})`);
  }
}
