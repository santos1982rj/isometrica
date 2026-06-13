import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses.service';

describe('CoursesService', () => {
  const mockPrisma = {
    subject: {
      upsert: vi.fn(),
    },
    course: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    purchase: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    enrollment: {
      upsert: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses a safe public professor select when listing courses', async () => {
    mockPrisma.course.findMany.mockResolvedValue([]);
    const service = new CoursesService(mockPrisma as any);

    await service.findAll();

    expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          professor: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              title: true,
              bio: true,
            },
          },
        }),
      }),
    );
  });

  it('associates the authenticated professor when creating a course', async () => {
    mockPrisma.subject.upsert.mockResolvedValue({ id: 'subject-1' });
    mockPrisma.course.create.mockResolvedValue({ id: 'course-1' });
    const service = new CoursesService(mockPrisma as any);

    await service.create(
      { name: 'Estruturas', description: 'Curso', category: 'Civil' },
      'professor-1',
    );

    expect(mockPrisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Estruturas',
        professorId: 'professor-1',
        subjectId: 'subject-1',
      }),
      include: {
        subject: true,
        professor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            title: true,
            bio: true,
          },
        },
      },
    });
  });

  describe('ownership', () => {
    it('allows professor owner to update course', async () => {
      const course = { id: 'course-1', professorId: 'professor-1', subjectId: null };
      mockPrisma.course.findUnique.mockResolvedValue(course);
      mockPrisma.course.update.mockResolvedValue({ ...course, name: 'Updated' });

      const service = new CoursesService(mockPrisma as any);
      const result = await service.update({ name: 'Updated' }, 'course-1', 'professor-1', 'PROFESSOR' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.course.update).toHaveBeenCalled();
    });

    it('blocks professor non-owner from updating course with 403', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', professorId: 'other-professor' });

      const service = new CoursesService(mockPrisma as any);
      await expect(
        service.update({ name: 'Hacked' }, 'course-1', 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.course.update).not.toHaveBeenCalled();
    });

    it('blocks professor non-owner from deleting course with 403', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', professorId: 'other-professor' });

      const service = new CoursesService(mockPrisma as any);
      await expect(
        service.remove('course-1', 'professor-2', 'PROFESSOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrisma.course.delete).not.toHaveBeenCalled();
    });

    it('allows admin to update any course', async () => {
      const course = { id: 'course-1', professorId: 'other-professor', subjectId: null };
      mockPrisma.course.findUnique.mockResolvedValue(course);
      mockPrisma.course.update.mockResolvedValue({ ...course, name: 'Updated by admin' });

      const service = new CoursesService(mockPrisma as any);
      const result = await service.update({ name: 'Updated by admin' }, 'course-1', 'admin-1', 'ADMIN' as any);

      expect(result).toBeDefined();
      expect(mockPrisma.course.update).toHaveBeenCalled();
    });

    it('allows admin to delete any course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', professorId: 'other-professor' });

      const service = new CoursesService(mockPrisma as any);
      await service.remove('course-1', 'admin-1', 'ADMIN' as any);

      expect(mockPrisma.course.delete).toHaveBeenCalledWith({ where: { id: 'course-1' } });
    });
  });

  it('validates that a purchased course exists before creating Purchase', async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);
    const service = new CoursesService(mockPrisma as any);

    await expect(service.purchaseCourse('user-1', 'missing-course')).rejects.toBeInstanceOf(NotFoundException);
    expect(mockPrisma.purchase.create).not.toHaveBeenCalled();
  });

  it('prevents duplicate course purchases for a user', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', premium: true, price: 99 });
    mockPrisma.purchase.findFirst.mockResolvedValue({ id: 'purchase-1' });
    const service = new CoursesService(mockPrisma as any);

    await expect(service.purchaseCourse('user-1', 'course-1')).rejects.toBeInstanceOf(ConflictException);
    expect(mockPrisma.purchase.create).not.toHaveBeenCalled();
  });
});
