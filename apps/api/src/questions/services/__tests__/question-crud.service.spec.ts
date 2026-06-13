import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuestionCrudService } from '../question-crud.service';

describe('QuestionCrudService', () => {
  const mockPrisma = {
    question: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    questionStats: {
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ownership', () => {
    it('sets createdById when creating a question', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-1', createdById: 'professor-1' });
      mockPrisma.questionStats.create.mockResolvedValue({});
      const service = new QuestionCrudService(mockPrisma as any);

      await service.create(
        { text: 'Question?', topicId: 't-1', difficulty: 'MEDIUM' as any, alternatives: [{ text: 'A', isCorrect: true }] },
        'professor-1',
      );

      expect(mockPrisma.question.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdById: 'professor-1',
          }),
        }),
      );
    });

    it('allows creator to update own question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: 'professor-1' });
      mockPrisma.question.update.mockResolvedValue({ id: 'q-1', text: 'Updated' });
      const service = new QuestionCrudService(mockPrisma as any);

      const result = await service.update('q-1', { text: 'Updated' }, 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.question.update).toHaveBeenCalled();
    });

    it('blocks non-owner professor from updating question with 403', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: 'other-prof' });
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.update('q-1', { text: 'Hacked' }, 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.question.update).not.toHaveBeenCalled();
    });

    it('blocks non-owner professor from deleting question with 403', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: 'other-prof' });
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.remove('q-1', 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.question.delete).not.toHaveBeenCalled();
    });

    it('allows admin to update any question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: 'other-prof' });
      mockPrisma.question.update.mockResolvedValue({ id: 'q-1', text: 'Updated by admin' });
      const service = new QuestionCrudService(mockPrisma as any);

      const result = await service.update('q-1', { text: 'Updated by admin' }, 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.question.update).toHaveBeenCalled();
    });

    it('allows admin to delete any question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: 'other-prof' });
      const service = new QuestionCrudService(mockPrisma as any);

      await service.remove('q-1', 'admin-1', 'ADMIN' as any);

      expect(mockPrisma.question.delete).toHaveBeenCalledWith({ where: { id: 'q-1' } });
    });

    it('blocks professor from updating question without createdById', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: null });
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.update('q-1', { text: 'Hacked' }, 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.question.update).not.toHaveBeenCalled();
    });

    it('blocks professor from deleting question without createdById', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: null });
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.remove('q-1', 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.question.delete).not.toHaveBeenCalled();
    });

    it('allows admin to update question without createdById', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: null });
      mockPrisma.question.update.mockResolvedValue({ id: 'q-1', text: 'Admin fixed' });
      const service = new QuestionCrudService(mockPrisma as any);

      const result = await service.update('q-1', { text: 'Admin fixed' }, 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.question.update).toHaveBeenCalled();
    });

    it('allows admin to delete question without createdById', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({ id: 'q-1', createdById: null });
      const service = new QuestionCrudService(mockPrisma as any);

      await service.remove('q-1', 'admin-1', 'ADMIN' as any);

      expect(mockPrisma.question.delete).toHaveBeenCalledWith({ where: { id: 'q-1' } });
    });

    it('returns 404 when professor deletes nonexistent question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.remove('missing', 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns 404 when admin deletes nonexistent question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.remove('missing', 'admin-1', 'ADMIN' as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns 404 when professor updates nonexistent question', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);
      const service = new QuestionCrudService(mockPrisma as any);

      await expect(
        service.update('missing', { text: 'Nope' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
