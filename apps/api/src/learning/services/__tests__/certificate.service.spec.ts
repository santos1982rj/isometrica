import { Test, TestingModule } from '@nestjs/testing';
import { CertificateService } from '../certificate.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProgressService } from '../progress.service';

describe('CertificateService', () => {
  let service: CertificateService;
  let prisma: any;
  let progress: any;

  const mockPrisma = {
    course: {
      findUnique: vi.fn(),
    },
    questionAttempt: {
      findMany: vi.fn(),
    },
    certificate: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const mockProgress = {
    getCourseProgress: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CertificateService(mockPrisma as any, mockProgress as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCertificate', () => {
    it('should NOT include subjectId filter when course.subjectId is null', async () => {
      const course = {
        id: 'course-1',
        name: 'Curso Genérico',
        certificateEnabled: true,
        subjectId: null,
        modules: [{ lessons: [1, 2] }],
        subject: null,
      };

      mockPrisma.course.findUnique.mockResolvedValue(course);
      mockProgress.getCourseProgress.mockResolvedValue({ percentage: 100 });
      mockPrisma.questionAttempt.findMany.mockResolvedValue([]);
      mockPrisma.certificate.findUnique.mockResolvedValue(null);
      mockPrisma.certificate.create.mockResolvedValue({
        id: 'cert-1',
        userId: 'user-1',
        courseId: 'course-1',
        title: 'Curso Genérico',
        proficiency: 0,
        totalHours: 2,
      });

      await service.generateCertificate('user-1', 'course-1');

      const callArgs = mockPrisma.questionAttempt.findMany.mock.calls[0][0];
      expect(callArgs.where).toEqual({ userId: 'user-1' });
      expect(callArgs.where).not.toHaveProperty('question.topic.subjectId');
    });

    it('should include subjectId filter when course.subjectId is set', async () => {
      const course = {
        id: 'course-2',
        name: 'Curso de Cálculo',
        certificateEnabled: true,
        subjectId: 'subject-1',
        modules: [{ lessons: [1, 2] }],
        subject: { id: 'subject-1', name: 'Cálculo I' },
      };

      mockPrisma.course.findUnique.mockResolvedValue(course);
      mockProgress.getCourseProgress.mockResolvedValue({ percentage: 100 });
      mockPrisma.questionAttempt.findMany.mockResolvedValue([
        { correct: true },
        { correct: true },
      ]);
      mockPrisma.certificate.findUnique.mockResolvedValue(null);
      mockPrisma.certificate.create.mockResolvedValue({
        id: 'cert-2',
        userId: 'user-1',
        courseId: 'course-2',
        title: 'Curso de Cálculo',
        proficiency: 100,
        totalHours: 2,
      });

      await service.generateCertificate('user-1', 'course-2');

      const callArgs = mockPrisma.questionAttempt.findMany.mock.calls[0][0];
      expect(callArgs.where.question.topic.subjectId).toBe('subject-1');
    });
  });
});
