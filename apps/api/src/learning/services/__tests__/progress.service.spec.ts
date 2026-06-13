import { EventType } from '../../../event-bus/interfaces/event.interface';
import { ProgressService } from '../progress.service';

describe('ProgressService', () => {
  const mockPrisma = {
    lessonProgress: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    course: {
      findUnique: vi.fn(),
    },
    enrollment: {
      findMany: vi.fn(),
    },
  };

  const mockEventBus = {
    publish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createService = () => new (ProgressService as any)(
    mockPrisma as any,
    mockEventBus as any,
    null, // studentModel
  );

  describe('markProgress', () => {
    it('publishes LESSON_COMPLETED on first completion', async () => {
      mockPrisma.lessonProgress.findUnique.mockResolvedValue(null);
      mockPrisma.lessonProgress.upsert.mockResolvedValue({ completed: true, progress: 100 });
      const service = createService();

      await service.markProgress('user-1', 'lesson-1', true);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: EventType.LESSON_COMPLETED }),
      );
    });

    it('does not publish LESSON_COMPLETED when re-completing same lesson', async () => {
      mockPrisma.lessonProgress.findUnique.mockResolvedValue({ completed: true, progress: 100 });
      mockPrisma.lessonProgress.upsert.mockResolvedValue({ completed: true, progress: 100 });
      const service = createService();

      await service.markProgress('user-1', 'lesson-1', true);

      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('still saves progress even when already completed', async () => {
      mockPrisma.lessonProgress.findUnique.mockResolvedValue({ completed: true, progress: 100 });
      mockPrisma.lessonProgress.upsert.mockResolvedValue({ completed: true, progress: 100 });
      const service = createService();

      await service.markProgress('user-1', 'lesson-1', true);

      expect(mockPrisma.lessonProgress.upsert).toHaveBeenCalled();
    });

    it('does not publish event when completed is false', async () => {
      mockPrisma.lessonProgress.findUnique.mockResolvedValue(null);
      mockPrisma.lessonProgress.upsert.mockResolvedValue({ completed: false, progress: 0 });
      const service = createService();

      await service.markProgress('user-1', 'lesson-1', false);

      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });
});
