import { ForbiddenException } from '@nestjs/common';
import { ExamService } from '../exam.service';

describe('ExamService', () => {
  const mockPrisma = {
    exam: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
    },
    questionTag: {
      groupBy: vi.fn(),
    },
    simuladoSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    simuladoAnswer: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ownership', () => {
    it('sets createdById when creating an exam', async () => {
      mockPrisma.exam.create.mockResolvedValue({ id: 'exam-1', createdById: 'professor-1' });
      const service = new ExamService(mockPrisma as any);

      await service.createExam({ name: 'Prova 1' }, 'professor-1');

      expect(mockPrisma.exam.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdById: 'professor-1',
          }),
        }),
      );
    });

    it('allows creator to update own exam', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', createdById: 'professor-1' });
      mockPrisma.exam.update.mockResolvedValue({ id: 'exam-1', name: 'Updated' });
      const service = new ExamService(mockPrisma as any);

      const result = await service.updateExam('exam-1', { name: 'Updated' }, 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.exam.update).toHaveBeenCalled();
    });

    it('blocks non-owner professor from updating exam with 403', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', createdById: 'other-prof' });
      const service = new ExamService(mockPrisma as any);

      await expect(
        service.updateExam('exam-1', { name: 'Hacked' }, 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.exam.update).not.toHaveBeenCalled();
    });

    it('blocks non-owner professor from deleting exam with 403', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', createdById: 'other-prof' });
      mockPrisma.exam.update.mockResolvedValue({ id: 'exam-1' });
      const service = new ExamService(mockPrisma as any);

      await expect(
        service.deleteExam('exam-1', 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.exam.delete).not.toHaveBeenCalled();
    });

    it('allows admin to update any exam', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', createdById: 'other-prof' });
      mockPrisma.exam.update.mockResolvedValue({ id: 'exam-1', name: 'Updated by admin' });
      const service = new ExamService(mockPrisma as any);

      const result = await service.updateExam('exam-1', { name: 'Updated by admin' }, 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.exam.update).toHaveBeenCalled();
    });

    it('allows admin to delete any exam', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', createdById: 'other-prof' });
      mockPrisma.exam.update.mockResolvedValue({ id: 'exam-1' });
      const service = new ExamService(mockPrisma as any);

      await service.deleteExam('exam-1', 'admin-1', 'ADMIN' as any);

      expect(mockPrisma.exam.delete).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
    });
  });

  describe('simulado resume', () => {
    beforeEach(() => {
      mockPrisma.simuladoSession.findFirst = vi.fn();
    });

    it('returns existing in-progress session instead of creating new one', async () => {
      const existingSession = {
        id: 'session-1', userId: 'user-1', examId: 'exam-1',
        status: 'em_andamento', totalQuestions: 5, startedAt: new Date(),
        exam: { id: 'exam-1', name: 'Prova 1', timeLimit: 60 },
        answers: [
          { questionId: 'q-1', selectedId: null, question: { id: 'q-1', text: 'Q?', difficulty: 'MEDIUM', topicId: 't-1', alternatives: [{ id: 'a-1', text: 'A' }, { id: 'a-2', text: 'B' }] } },
        ],
      };
      mockPrisma.simuladoSession.findFirst.mockResolvedValue(existingSession);
      const service = new ExamService(mockPrisma as any);

      const result = await service.startSimulado('user-1', 'exam-1');

      expect(result.resumed).toBe(true);
      expect(result.sessionId).toBe('session-1');
      expect(mockPrisma.simuladoSession.create).not.toHaveBeenCalled();
    });

    it('creates new session when no existing in-progress session', async () => {
      mockPrisma.simuladoSession.findFirst.mockResolvedValue(null);
      mockPrisma.exam.findUnique.mockResolvedValue({
        id: 'exam-1', name: 'Prova 1', timeLimit: 60,
        questions: [
          { id: 'q-1', text: 'Q?', difficulty: 'MEDIUM', topicId: 't-1', status: 'PUBLICADA', alternatives: [{ id: 'a-1', text: 'A' }, { id: 'a-2', text: 'B' }] },
        ],
      });
      mockPrisma.simuladoSession.create.mockResolvedValue({ id: 'session-new', userId: 'user-1', examId: 'exam-1', totalQuestions: 1, startedAt: new Date() });
      const service = new ExamService(mockPrisma as any);

      const result = await service.startSimulado('user-1', 'exam-1');

      expect(result.resumed).toBe(false);
      expect(mockPrisma.simuladoSession.create).toHaveBeenCalled();
    });

    it('resumed session does not leak isCorrect in alternatives', async () => {
      const existingSession = {
        id: 'session-1', userId: 'user-1', examId: 'exam-1',
        status: 'em_andamento', totalQuestions: 5, startedAt: new Date(),
        exam: { id: 'exam-1', name: 'Prova 1', timeLimit: 60 },
        answers: [
          { questionId: 'q-1', selectedId: null, question: { id: 'q-1', text: 'Q?', difficulty: 'MEDIUM', topicId: 't-1', alternatives: [{ id: 'a-1', text: 'A', isCorrect: true }, { id: 'a-2', text: 'B', isCorrect: false }] } },
        ],
      };
      mockPrisma.simuladoSession.findFirst.mockResolvedValue(existingSession);
      const service = new ExamService(mockPrisma as any);

      const result = await service.startSimulado('user-1', 'exam-1');

      // Alternatives should not include isCorrect
      for (const q of result.questions) {
        for (const alt of q.alternatives) {
          expect((alt as any).isCorrect).toBeUndefined();
        }
      }
    });

    it('blocks submit from another user', async () => {
      mockPrisma.simuladoSession.findUnique.mockResolvedValue({ id: 'session-1', userId: 'other-user', status: 'em_andamento' });
      const service = new ExamService(mockPrisma as any);

      await expect(
        service.submitSimulado('session-1', 'user-1', []),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('simulado timeout', () => {
    it('blocks submission when session is expired beyond timeLimit', async () => {
      const past = new Date(Date.now() - 7200000); // 2 hours ago
      mockPrisma.simuladoSession.findUnique.mockResolvedValue({
        id: 'session-1', userId: 'user-1', examId: 'exam-1',
        status: 'em_andamento', startedAt: past,
      });
      mockPrisma.simuladoAnswer.findMany.mockResolvedValue([]);
      mockPrisma.exam.findUnique.mockResolvedValue({ id: 'exam-1', timeLimit: 60 }); // 60 min limit
      const service = new ExamService(mockPrisma as any);

      await expect(
        service.submitSimulado('session-1', 'user-1', []),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.simuladoAnswer.updateMany).not.toHaveBeenCalled();
    });

    it('allows submission within timeLimit', async () => {
      const recent = new Date(Date.now() - 600000); // 10 min ago
      mockPrisma.simuladoSession.findUnique.mockResolvedValue({
        id: 'session-1', userId: 'user-1', examId: 'exam-1',
        status: 'em_andamento', startedAt: recent, totalQuestions: 0,
      });
      mockPrisma.simuladoAnswer.findMany.mockResolvedValue([]);
      mockPrisma.simuladoSession.update.mockResolvedValue({});
      const service = new ExamService(mockPrisma as any);

      await service.submitSimulado('session-1', 'user-1', []);

      expect(mockPrisma.simuladoSession.update).toHaveBeenCalled();
    });

    it('allows submission when exam has no timeLimit', async () => {
      mockPrisma.simuladoSession.findUnique.mockResolvedValue({
        id: 'session-1', userId: 'user-1', examId: 'exam-1',
        status: 'em_andamento', startedAt: new Date(), totalQuestions: 0,
      });
      mockPrisma.simuladoAnswer.findMany.mockResolvedValue([]);
      mockPrisma.simuladoSession.update.mockResolvedValue({});
      const service = new ExamService(mockPrisma as any);

      await service.submitSimulado('session-1', 'user-1', []);

      expect(mockPrisma.simuladoSession.update).toHaveBeenCalled();
    });
  });
});
