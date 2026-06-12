import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, imageUrl: true, role: true,
        university: true, period: true, title: true, bio: true,
        lattes: true, linkedin: true, instagram: true, twitter: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const gamification = await this.prisma.gamificationProfile.findUnique({ where: { userId } });
    const certificates = await this.prisma.certificate.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });

    const attempts = await this.prisma.questionAttempt.findMany({ where: { userId } });
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.correct).length;

    const coursesCreated = user.role === 'PROFESSOR' || user.role === 'ADMIN'
      ? await this.prisma.course.count({ where: { /* TODO: ownerId when added */ } })
      : 0;

    const totalStudents = user.role === 'PROFESSOR'
      ? await this.prisma.enrollment.groupBy({ by: ['courseId'], _count: { userId: true } })
      : [];

    return {
      user,
      gamification: gamification ? { xp: gamification.xp, level: gamification.level, streak: gamification.streak } : null,
      certificates,
      enrollments: enrollments.map((e) => ({ id: e.id, courseId: e.courseId, courseName: e.course.name, progress: e.progress })),
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        totalCertificates: certificates.length,
        coursesCreated,
      },
    };
  }

  async updateProfile(userId: string, data: {
    name?: string; bio?: string; title?: string; university?: string;
    period?: number; lattes?: string; linkedin?: string; instagram?: string; twitter?: string;
    imageUrl?: string;
  }) {
    return this.prisma.user.update({ where: { id: userId }, data, select: { id: true, name: true, email: true, imageUrl: true, role: true, university: true, period: true, title: true, bio: true, lattes: true, linkedin: true, instagram: true, twitter: true } });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, imageUrl: true, role: true, title: true, bio: true,
        lattes: true, linkedin: true, instagram: true, twitter: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const certificates = await this.prisma.certificate.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });

    const gamification = user.role === 'STUDENT'
      ? await this.prisma.gamificationProfile.findUnique({ where: { userId } })
      : null;

    const coursesCreated = user.role === 'PROFESSOR'
      ? await this.prisma.course.findMany({ where: {}, take: 20 })
      : [];

    return {
      user: { id: user.id, name: user.name, imageUrl: user.imageUrl, role: user.role, title: user.title, bio: user.bio, lattes: user.lattes, linkedin: user.linkedin, instagram: user.instagram, twitter: user.twitter, createdAt: user.createdAt },
      certificates: certificates.map((c) => ({ id: c.id, title: c.title, proficiency: c.proficiency, totalHours: c.totalHours, courseName: c.course?.name ?? '', createdAt: c.createdAt })),
      gamification: gamification ? { xp: gamification.xp, level: gamification.level, streak: gamification.streak } : null,
      coursesCreated: coursesCreated.map((c) => ({ id: c.id, name: c.name, description: c.description, category: c.category })),
    };
  }
}
