import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { EventType, AppEvent } from '../interfaces/event.interface';
import { AnalyticsService } from '../../analytics/analytics.service';
import { EventType as PrismaEventType } from '../../generated/prisma/enums';

const EVENT_TYPE_MAP: Partial<Record<EventType, PrismaEventType>> = {
  [EventType.USER_CREATED]: PrismaEventType.ENROLLMENT_CREATED,
  [EventType.LESSON_STARTED]: PrismaEventType.LESSON_STARTED,
  [EventType.LESSON_COMPLETED]: PrismaEventType.LESSON_COMPLETED,
  [EventType.QUESTION_ANSWERED]: PrismaEventType.QUESTION_ANSWERED,
  [EventType.QUESTION_CORRECT]: PrismaEventType.QUESTION_CORRECT,
  [EventType.QUESTION_INCORRECT]: PrismaEventType.QUESTION_INCORRECT,
  [EventType.HINT_USED]: PrismaEventType.HINT_USED,
  [EventType.CONVERSATION_STARTED]: PrismaEventType.CONVERSATION_STARTED,
  [EventType.MESSAGE_SENT]: PrismaEventType.MESSAGE_SENT,
  [EventType.DIAGNOSTIC_COMPLETED]: PrismaEventType.DIAGNOSTIC_COMPLETED,
  [EventType.ACHIEVEMENT_UNLOCKED]: PrismaEventType.ACHIEVEMENT_UNLOCKED,
  [EventType.STREAK_UPDATED]: PrismaEventType.STREAK_UPDATED,
  [EventType.LEVEL_UP]: PrismaEventType.LEVEL_UP,
  [EventType.SUBSCRIPTION_CREATED]: PrismaEventType.SUBSCRIPTION_CREATED,
  [EventType.SUBSCRIPTION_CANCELLED]: PrismaEventType.SUBSCRIPTION_CANCELLED,
  [EventType.PAYMENT_SUCCEEDED]: PrismaEventType.PAYMENT_SUCCEEDED,
  [EventType.PAYMENT_FAILED]: PrismaEventType.PAYMENT_FAILED,
  [EventType.ENROLLMENT_CREATED]: PrismaEventType.ENROLLMENT_CREATED,
};

@Injectable()
export class AnalyticsEventHandler {
  private readonly logger = new Logger(AnalyticsEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly analytics: AnalyticsService,
  ) {
    const events = Object.values(EventType);
    events.forEach((eventType) => {
      this.eventBus.registerHandler(eventType, (event) => this.handle(event));
    });
  }

  private async handle(event: AppEvent): Promise<void> {
    try {
      const prismaType = EVENT_TYPE_MAP[event.type];
      if (!prismaType) {
        this.logger.debug(`Skipping unmapped event type: ${event.type}`);
        return;
      }

      await this.analytics.trackEvent(event.userId, prismaType, event.metadata);
      this.logger.debug(`Analytics tracked: ${event.type} for user ${event.userId}`);
    } catch (err) {
      this.logger.error(`Failed to track event ${event.type}`, err);
    }
  }
}
