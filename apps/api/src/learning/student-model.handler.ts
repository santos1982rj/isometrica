import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { EventType } from '../event-bus/interfaces/event.interface';
import { StudentModelService } from './student-model.service';

@Injectable()
export class StudentModelEventHandler {
  private readonly logger = new Logger(StudentModelEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly studentModel: StudentModelService,
  ) {
    this.eventBus.registerHandler(EventType.QUESTION_CORRECT, (event) => this.onQuestionAnswered(event));
    this.eventBus.registerHandler(EventType.QUESTION_INCORRECT, (event) => this.onQuestionAnswered(event));
  }

  private async onQuestionAnswered(event: {
    userId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const topicId = event.metadata?.topicId as string;
    const correct = event.metadata?.correct as boolean;
    const timeSpent = event.metadata?.timeSpent as number | undefined;
    const hintUsed = event.metadata?.hintUsed as boolean | undefined;

    if (!topicId) return;

    const proficiency = await this.studentModel.updateProficiency({
      userId: event.userId,
      topicId,
      correct,
      timeSpent,
      hintUsed,
    });

    this.logger.debug(`Proficiency updated for user ${event.userId}, topic ${topicId}: ${proficiency}`);
  }
}
