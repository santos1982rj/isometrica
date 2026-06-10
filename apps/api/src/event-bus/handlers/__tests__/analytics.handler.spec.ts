import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsEventHandler } from '../analytics.handler';
import { EventBusService } from '../../event-bus.service';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { EventType, AppEvent } from '../../interfaces/event.interface';

describe('AnalyticsEventHandler', () => {
  let handler: AnalyticsEventHandler;
  let analytics: any;
  let eventBus: any;

  const mockAnalytics = {
    trackEvent: vi.fn().mockResolvedValue({ id: 'evt-1' }),
  };

  const mockEventBus = {
    registerHandler: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new AnalyticsEventHandler(mockEventBus as any, mockAnalytics as any);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should register handlers for all event types', () => {
    const eventCount = Object.keys(EventType).length;
    expect(mockEventBus.registerHandler).toHaveBeenCalledTimes(eventCount);
  });

  describe('handle', () => {
    it('should track mapped event types', async () => {
      const event: AppEvent = { type: EventType.LESSON_COMPLETED, userId: 'user-1', timestamp: new Date() };

      await (handler as any).handle(event);

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('user-1', 'LESSON_COMPLETED', undefined);
    });

    it('should skip unmapped event types', async () => {
      const event: AppEvent = { type: EventType.XP_GAINED, userId: 'user-1', timestamp: new Date() };

      await (handler as any).handle(event);

      expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
    });

    it('should not throw on analytics error', async () => {
      mockAnalytics.trackEvent.mockRejectedValueOnce(new Error('DB error'));
      const event: AppEvent = { type: EventType.QUESTION_CORRECT, userId: 'user-1', timestamp: new Date() };

      await expect((handler as any).handle(event)).resolves.toBeUndefined();
    });
  });
});
