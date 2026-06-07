import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { EventType, AppEvent } from '../interfaces/event.interface';

@Injectable()
export class AnalyticsEventHandler {
  private readonly logger = new Logger(AnalyticsEventHandler.name);

  constructor(private readonly eventBus: EventBusService) {
    const events = Object.values(EventType);
    events.forEach((eventType) => {
      this.eventBus.registerHandler(eventType, (event) => this.handle(event));
    });
  }

  private async handle(event: AppEvent): Promise<void> {
    this.logger.debug(`Analytics processing: ${event.type}`);
  }
}
