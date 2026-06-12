import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from './progress.service';

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  async generateCertificate(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { include: { lessons: true } }, subject: true },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.certificateEnabled) {
      throw new BadRequestException('Este curso não oferece certificado');
    }

    const progress = await this.progress.getCourseProgress(userId, courseId);
    if (progress.percentage < 100) {
      throw new BadRequestException('Complete todas as aulas para obter o certificado');
    }

    const subjectFilter = course.subjectId ? { question: { topic: { subjectId: course.subjectId } } } : {};
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId, ...subjectFilter },
    });
    const acertos = attempts.filter((a) => a.correct).length;
    const proficiency = attempts.length > 0 ? Math.round((acertos / attempts.length) * 100) : 0;
    const totalHours = course.modules.reduce((h, m) => h + m.lessons.length, 0);

    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    return this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        title: course.name,
        proficiency,
        totalHours,
      },
      include: { course: { include: { subject: true } } },
    });
  }

  getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { include: { subject: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
