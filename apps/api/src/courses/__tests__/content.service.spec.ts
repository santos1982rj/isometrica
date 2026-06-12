import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from '../content.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ContentService', () => {
  let service: ContentService;
  let prisma: any;

  const mockPrisma = {
    course: {
      findUnique: vi.fn(),
    },
    module: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    lesson: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    question: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContentService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLesson', () => {
    it('should map contentUrl from the body, not videoUrl', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({ id: 'module-1' });
      mockPrisma.lesson.create.mockResolvedValue({
        id: 'lesson-1',
        title: 'Aula 1',
        contentUrl: 'https://youtube.com/abc123',
        content: null,
        type: 'video',
        order: 1,
        free: true,
        moduleId: 'module-1',
      });

      await service.createLesson('module-1', {
        title: 'Aula 1',
        type: 'video',
        order: 1,
        contentUrl: 'https://youtube.com/abc123',
        free: true,
      });

      expect(mockPrisma.lesson.create).toHaveBeenCalledWith({
        data: {
          title: 'Aula 1',
          type: 'video',
          order: 1,
          content: undefined,
          free: true,
          contentUrl: 'https://youtube.com/abc123',
          moduleId: 'module-1',
        },
      });
    });
  });

  describe('updateLesson', () => {
    it('should use contentUrl field, not videoUrl', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1' });
      mockPrisma.lesson.update.mockResolvedValue({
        id: 'lesson-1',
        title: 'Aula 1 Atualizada',
        contentUrl: 'https://youtube.com/updated',
      });

      await service.updateLesson('lesson-1', {
        title: 'Aula 1 Atualizada',
        contentUrl: 'https://youtube.com/updated',
      });

      expect(mockPrisma.lesson.update).toHaveBeenCalledWith({
        where: { id: 'lesson-1' },
        data: {
          title: 'Aula 1 Atualizada',
          contentUrl: 'https://youtube.com/updated',
        },
      });
    });
  });
});
