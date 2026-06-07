import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { AppEvent, EventType } from '../interfaces/event.interface';

@Injectable()
export class AiEventHandler {
  private readonly logger = new Logger(AiEventHandler.name);

  constructor(private readonly eventBus: EventBusService) {
    this.eventBus.registerHandler(EventType.QUESTION_INCORRECT, (event) => this.onIncorrectAnswer(event));
    this.eventBus.registerHandler(EventType.ENROLLMENT_CREATED, (event) => this.onEnrollment(event));
  }

  private async onIncorrectAnswer(event: AppEvent): Promise<void> {
    this.logger.debug(`AI: analyzing incorrect answer for user ${event.userId}`);
  }

  private async onEnrollment(event: AppEvent): Promise<void> {
    this.logger.debug(`AI: generating recommendations for user ${event.userId}`);
  }
}
