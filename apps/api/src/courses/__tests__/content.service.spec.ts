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
      deleteMany: vi.fn(),
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
    lessonMaterial: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const mockCourseWithOwner = { id: 'course-1', professorId: 'professor-1' };
  const mockCourseOther = { id: 'course-2', professorId: 'other-prof' };
  const mockModuleOwned = { id: 'module-1', courseId: 'course-1', course: { professorId: 'professor-1' } };
  const mockModuleOther = { id: 'module-2', courseId: 'course-2', course: { professorId: 'other-prof' } };
  const mockLessonOwned = { id: 'lesson-1', moduleId: 'module-1', module: { courseId: 'course-1', course: { professorId: 'professor-1' } } };
  const mockLessonOther = { id: 'lesson-2', moduleId: 'module-2', module: { courseId: 'course-2', course: { professorId: 'other-prof' } } };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContentService(mockPrisma as any);
  });

  const mockMaterialOwned = { id: 'mat-1', lessonId: 'lesson-1', lesson: { moduleId: 'module-1', module: { courseId: 'course-1', course: { professorId: 'professor-1' } } } };
  const mockMaterialOther = { id: 'mat-2', lessonId: 'lesson-2', lesson: { moduleId: 'module-2', module: { courseId: 'course-2', course: { professorId: 'other-prof' } } } };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLesson', () => {
    it('should map contentUrl from the body, not videoUrl', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({ id: 'module-1', courseId: 'course-1', course: { professorId: 'admin-1' } });
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
      }, 'admin-1', 'ADMIN' as any);

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

  describe('ownership', () => {
    it('blocks professor from creating module in another professor\'s course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourseOther);

      await expect(
        service.createModule('course-2', { name: 'Module', order: 1 }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.module.create).not.toHaveBeenCalled();
    });

    it('allows professor to create module in own course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourseWithOwner);
      mockPrisma.module.create.mockResolvedValue({ id: 'mod-1' });

      const result = await service.createModule('course-1', { name: 'Module', order: 1 }, 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.module.create).toHaveBeenCalled();
    });

    it('allows admin to create module in any course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourseOther);
      mockPrisma.module.create.mockResolvedValue({ id: 'mod-1' });

      const result = await service.createModule('course-2', { name: 'Module', order: 1 }, 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.module.create).toHaveBeenCalled();
    });

    it('blocks professor from updating module from another professor\'s course', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(mockModuleOther);

      await expect(
        service.updateModule('module-2', { name: 'Hacked' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.module.update).not.toHaveBeenCalled();
    });

    it('blocks professor from deleting module from another professor\'s course', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(mockModuleOther);

      await expect(
        service.removeModule('module-2', 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.module.delete).not.toHaveBeenCalled();
    });

    it('blocks professor from updating lesson from another professor\'s course', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(mockLessonOther);

      await expect(
        service.updateLesson('lesson-2', { title: 'Hacked' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lesson.update).not.toHaveBeenCalled();
    });

    it('blocks professor from deleting lesson from another professor\'s course', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(mockLessonOther);

      await expect(
        service.removeLesson('lesson-2', 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lesson.delete).not.toHaveBeenCalled();
    });
  });

  describe('lessonMaterial ownership', () => {
    const mockMaterialOwned = { id: 'mat-1', lessonId: 'lesson-1', lesson: { moduleId: 'module-1', module: { courseId: 'course-1', course: { professorId: 'professor-1' } } } };
    const mockMaterialOther = { id: 'mat-2', lessonId: 'lesson-2', lesson: { moduleId: 'module-2', module: { courseId: 'course-2', course: { professorId: 'other-prof' } } } };

    it('allows professor to create material in own lesson', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1', moduleId: 'module-1', module: { courseId: 'course-1', course: { professorId: 'professor-1' } } });
      mockPrisma.lessonMaterial.create.mockResolvedValue({ id: 'mat-1', name: 'Material' });

      const result = await service.createLessonMaterial('lesson-1', { name: 'Material', url: 'https://exemplo.com/pdf' }, 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.lessonMaterial.create).toHaveBeenCalled();
    });

    it('blocks professor from creating material in another professor\'s lesson', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-2', moduleId: 'module-2', module: { courseId: 'course-2', course: { professorId: 'other-prof' } } });

      await expect(
        service.createLessonMaterial('lesson-2', { name: 'Hacked', url: 'https://evil.com' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lessonMaterial.create).not.toHaveBeenCalled();
    });

    it('allows professor to update own lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOwned);
      mockPrisma.lessonMaterial.update.mockResolvedValue({ id: 'mat-1', name: 'Updated' });

      const result = await service.updateLessonMaterial('mat-1', { name: 'Updated' }, 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.lessonMaterial.update).toHaveBeenCalled();
    });

    it('blocks professor from updating another professor\'s lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOther);

      await expect(
        service.updateLessonMaterial('mat-2', { name: 'Hacked' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lessonMaterial.update).not.toHaveBeenCalled();
    });

    it('allows professor to remove own lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOwned);

      await service.removeLessonMaterial('mat-1', 'professor-1', 'PROFESSOR' as any);

      expect(mockPrisma.lessonMaterial.delete).toHaveBeenCalled();
    });

    it('blocks professor from removing another professor\'s lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOther);

      await expect(
        service.removeLessonMaterial('mat-2', 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lessonMaterial.delete).not.toHaveBeenCalled();
    });

    it('allows admin to update any lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOther);
      mockPrisma.lessonMaterial.update.mockResolvedValue({ id: 'mat-2', name: 'Admin fixed' });

      const result = await service.updateLessonMaterial('mat-2', { name: 'Admin fixed' }, 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.lessonMaterial.update).toHaveBeenCalled();
    });

    it('allows admin to remove any lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(mockMaterialOther);

      await service.removeLessonMaterial('mat-2', 'admin-1', 'ADMIN' as any);

      expect(mockPrisma.lessonMaterial.delete).toHaveBeenCalled();
    });

    it('returns 404 when updating nonexistent lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(null);

      await expect(
        service.updateLessonMaterial('missing', { name: 'Nope' }, 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lessonMaterial.update).not.toHaveBeenCalled();
    });

    it('returns 404 when removing nonexistent lesson material', async () => {
      mockPrisma.lessonMaterial.findUnique.mockResolvedValue(null);

      await expect(
        service.removeLessonMaterial('missing', 'professor-1', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(Error);

      expect(mockPrisma.lessonMaterial.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateLesson', () => {
    it('should use contentUrl field, not videoUrl', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1', moduleId: 'module-1', module: { courseId: 'course-1', course: { professorId: 'admin-1' } } });
      mockPrisma.lesson.update.mockResolvedValue({
        id: 'lesson-1',
        title: 'Aula 1 Atualizada',
        contentUrl: 'https://youtube.com/updated',
      });

      await service.updateLesson('lesson-1', {
        title: 'Aula 1 Atualizada',
        contentUrl: 'https://youtube.com/updated',
      }, 'admin-1', 'ADMIN' as any);

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
