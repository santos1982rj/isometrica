import { ConflictException, NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses.service';

describe('CoursesService', () => {
  const mockPrisma = {
    subject: {
      upsert: vi.fn(),
    },
    course: {
      create: vi.fn(),
      findUnique: vi.fn(),
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
      include: { subject: true, professor: true },
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
