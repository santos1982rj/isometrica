import { AttemptService } from '../attempt.service';
import { EventType } from '../../../event-bus/interfaces/event.interface';

describe('AttemptService', () => {
  const mockPrisma = {
    alternative: {
      findFirst: vi.fn(),
    },
    questionAttempt: {
      create: vi.fn(),
    },
  };

  const mockEventBus = {
    publish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates correctness from the selected alternative instead of trusting client data', async () => {
    mockPrisma.alternative.findFirst.mockResolvedValue({
      id: 'alt-1',
      questionId: 'question-1',
      isCorrect: true,
    });
    mockPrisma.questionAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      userId: 'user-1',
      questionId: 'question-1',
      selectedId: 'alt-1',
      correct: true,
      question: { topicId: 'topic-1' },
    });

    const service = new AttemptService(mockPrisma as any, mockEventBus as any);

    await service.submitAttempt({
      userId: 'user-1',
      questionId: 'question-1',
      selectedId: 'alt-1',
      correct: false,
      timeSpent: 12,
    } as any);

    expect(mockPrisma.questionAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ correct: true }),
      include: { question: true },
    });
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EventType.QUESTION_CORRECT,
        metadata: expect.objectContaining({ correct: true }),
      }),
    );
  });
});
