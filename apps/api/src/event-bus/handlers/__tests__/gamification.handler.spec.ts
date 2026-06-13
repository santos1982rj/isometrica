import { GamificationEventHandler } from '../gamification.handler';
import { EventType } from '../../interfaces/event.interface';
import { CONFIG } from '../../../common/config';

describe('GamificationEventHandler', () => {
  let mockGamification: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockGamification = {
      addXp: vi.fn(),
      updateStreak: vi.fn(),
      unlockAchievement: vi.fn(),
      getProfile: vi.fn(),
    };
    mockEventBus = {
      registerHandler: vi.fn(),
    };
  });

  describe('handlers registered', () => {
    it('registers handlers for all gamification events', () => {
      new GamificationEventHandler(mockEventBus, mockGamification);

      const registeredTypes = mockEventBus.registerHandler.mock.calls.map((c: any[]) => c[0]);
      expect(registeredTypes).toContain(EventType.QUESTION_CORRECT);
      expect(registeredTypes).toContain(EventType.QUESTION_INCORRECT);
      expect(registeredTypes).toContain(EventType.LESSON_COMPLETED);
      expect(registeredTypes).toContain(EventType.STREAK_UPDATED);
      expect(registeredTypes).toContain(EventType.SIMULADO_FINISHED);
    });
  });

  describe('onQuestionAnswered', () => {
    it('calls addXp when answer is correct', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.QUESTION_CORRECT,
      )?.[1];

      await handlerFn({ userId: 'user-1', metadata: { correct: true } });

      expect(mockGamification.addXp).toHaveBeenCalledWith('user-1', CONFIG.xp.question);
    });

    it('does not call addXp when answer is incorrect', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.QUESTION_INCORRECT,
      )?.[1];

      await handlerFn({ userId: 'user-1', metadata: { correct: false } });

      expect(mockGamification.addXp).not.toHaveBeenCalled();
    });

    it('does not call addXp when metadata.correct is missing', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.QUESTION_CORRECT,
      )?.[1];

      await handlerFn({ userId: 'user-1', metadata: {} });

      expect(mockGamification.addXp).not.toHaveBeenCalled();
    });

    it('unlocks first correct answer achievement', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.QUESTION_CORRECT,
      )?.[1];

      await handlerFn({ userId: 'user-1', metadata: { correct: true } });

      expect(mockGamification.unlockAchievement).toHaveBeenCalledWith(
        'user-1', 'Primeira resposta certa', expect.any(String), 'CheckCircle',
      );
    });
  });

  describe('onLessonCompleted', () => {
    it('calls addXp with lesson XP value', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.LESSON_COMPLETED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.addXp).toHaveBeenCalledWith('user-1', CONFIG.xp.lesson);
    });

    it('calls updateStreak', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.LESSON_COMPLETED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.updateStreak).toHaveBeenCalledWith('user-1');
    });

    it('unlocks first lesson achievement', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.LESSON_COMPLETED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.unlockAchievement).toHaveBeenCalledWith(
        'user-1', 'Primeira aula', expect.any(String), 'Play',
      );
    });
  });

  describe('onSimuladoFinished', () => {
    it('awards 30 XP for simulado completion', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.SIMULADO_FINISHED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.addXp).toHaveBeenCalledWith('user-1', 30);
    });

    it('unlocks first simulado achievement', async () => {
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.SIMULADO_FINISHED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.unlockAchievement).toHaveBeenCalledWith(
        'user-1', 'Primeiro simulado', expect.any(String), 'FileCheck',
      );
    });
  });

  describe('checkStreakAchievements', () => {
    it('unlocks achievement at streak 3', async () => {
      mockGamification.getProfile.mockResolvedValue({ streak: 3 });
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.STREAK_UPDATED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.unlockAchievement).toHaveBeenCalledWith(
        'user-1', 'Três dias seguidos', expect.any(String), 'Flame',
      );
    });

    it('does not unlock streak achievement below threshold', async () => {
      mockGamification.getProfile.mockResolvedValue({ streak: 1 });
      const handler = new GamificationEventHandler(mockEventBus, mockGamification);
      const handlerFn = mockEventBus.registerHandler.mock.calls.find(
        (c: any[]) => c[0] === EventType.STREAK_UPDATED,
      )?.[1];

      await handlerFn({ userId: 'user-1' });

      expect(mockGamification.unlockAchievement).not.toHaveBeenCalled();
    });
  });
});
