import { Test, TestingModule } from '@nestjs/testing';
import { AiEventHandler } from '../ai.handler';
import { EventBusService } from '../../event-bus.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventType, AppEvent } from '../../interfaces/event.interface';

describe('AiEventHandler', () => {
  let handler: AiEventHandler;
  let prisma: any;
  let eventBus: any;

  const mockPrisma = {
    recommendation: {
      create: vi.fn().mockResolvedValue({ id: 'rec-1' }),
    },
  };

  const mockEventBus = {
    registerHandler: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new AiEventHandler(mockEventBus as any, mockPrisma as any);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should register handlers for QUESTION_INCORRECT and ENROLLMENT_CREATED', () => {
    expect(mockEventBus.registerHandler).toHaveBeenCalledTimes(2);
    expect(mockEventBus.registerHandler).toHaveBeenCalledWith(EventType.QUESTION_INCORRECT, expect.any(Function));
    expect(mockEventBus.registerHandler).toHaveBeenCalledWith(EventType.ENROLLMENT_CREATED, expect.any(Function));
  });

  describe('onIncorrectAnswer', () => {
    it('should create a revision recommendation', async () => {
      const event: AppEvent = { type: EventType.QUESTION_INCORRECT, userId: 'user-1', timestamp: new Date() };

      await (handler as any).onIncorrectAnswer(event);

      expect(mockPrisma.recommendation.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'Rever tópico com dificuldade',
          description: expect.stringContaining('revisar o conteúdo'),
          type: 'revision',
        },
      });
    });

    it('should not throw on prisma error', async () => {
      mockPrisma.recommendation.create.mockRejectedValueOnce(new Error('DB error'));
      const event: AppEvent = { type: EventType.QUESTION_INCORRECT, userId: 'user-1', timestamp: new Date() };

      await expect((handler as any).onIncorrectAnswer(event)).resolves.toBeUndefined();
    });
  });

  describe('onEnrollment', () => {
    it('should create an onboarding recommendation', async () => {
      const event: AppEvent = { type: EventType.ENROLLMENT_CREATED, userId: 'user-2', timestamp: new Date() };

      await (handler as any).onEnrollment(event);

      expect(mockPrisma.recommendation.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-2',
          title: 'Comece pelos primeiros módulos',
          description: expect.stringContaining('matriculou'),
          type: 'onboarding',
        },
      });
    });
  });
});
