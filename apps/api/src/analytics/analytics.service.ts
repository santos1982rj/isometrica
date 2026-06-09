import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventType } from '../generated/prisma/enums';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  trackEvent(userId: string, type: EventType, metadata?: Record<string, unknown>) {
    return this.prisma.event.create({ data: { userId, type, metadata: metadata as Prisma.InputJsonValue } });
  }

  getUserEvents(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  getEventSummary() {
    return this.prisma.event.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
  }

  async getProfessorAnalytics() {
    const courses = await this.prisma.course.findMany({
      include: {
        subject: true,
        modules: { include: { lessons: true } },
        enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    const allLessonIds = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => l.id)));
    const allEnrollmentUserIds = [...new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId)))];

    // Get attempts stats per course
    const attempts = await this.prisma.questionAttempt.groupBy({
      by: ['userId', 'correct'],
      _count: { id: true },
      where: { question: { topic: { subjectId: { in: courses.map((c) => c.subjectId).filter(Boolean) as string[] } } } },
    });

    const courseStats = await Promise.all(courses.map(async (course) => {
      const cLessons = course.modules.flatMap((m) => m.lessons);
      const cLessonIds = cLessons.map((l) => l.id);
      const completedLessons = await this.prisma.lessonProgress.count({
        where: { lessonId: { in: cLessonIds }, completed: true },
      });

      const totalPossible = cLessonIds.length * course.enrollments.length;
      const completionRate = totalPossible > 0 ? Math.round((completedLessons / totalPossible) * 100) : 0;

      return {
        id: course.id,
        name: course.name,
        subject: course.subject?.name ?? course.category ?? 'Geral',
        totalLessons: cLessonIds.length,
        totalStudents: course.enrollments.length,
        completionRate,
      };
    }));

    const totalAttempts = attempts.reduce((a, r) => a + r._count.id, 0);
    const correctAttempts = attempts.filter((r) => r.correct).reduce((a, r) => a + r._count.id, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Students needing attention (low accuracy, < 50%)
    const studentAccuracy: Record<string, { total: number; correct: number; name: string }> = {};
    for (const a of attempts) {
      if (!studentAccuracy[a.userId]) {
        const user = await this.prisma.user.findUnique({ where: { id: a.userId }, select: { name: true } });
        studentAccuracy[a.userId] = { total: 0, correct: 0, name: user?.name ?? 'Unknown' };
      }
      studentAccuracy[a.userId].total += a._count.id;
      if (a.correct) studentAccuracy[a.userId].correct += a._count.id;
    }

    const strugglingStudents = Object.entries(studentAccuracy)
      .filter(([, s]) => s.total > 0 && (s.correct / s.total) < 0.5)
      .map(([id, s]) => ({ id, name: s.name, accuracy: Math.round((s.correct / s.total) * 100), totalQuestions: s.total }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    return {
      overview: {
        totalCourses: courses.length,
        totalStudents: allEnrollmentUserIds.length,
        totalLessons: allLessonIds.length,
        avgAccuracy,
      },
      courses: courseStats,
      strugglingStudents,
    };
  }

  async getCourseStudents(courseId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
        course: { include: { modules: { include: { lessons: true } } } },
      },
    });

    const course = enrollments[0]?.course;
    if (!course) return { students: [] };

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    return Promise.all(enrollments.map(async (e) => {
      const completedCount = await this.prisma.lessonProgress.count({
        where: { userId: e.user.id, lessonId: { in: allLessonIds }, completed: true },
      });

      const userAttempts = await this.prisma.questionAttempt.findMany({
        where: { userId: e.user.id },
      });
      const total = userAttempts.length;
      const correct = userAttempts.filter((a) => a.correct).length;

      return {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        imageUrl: e.user.imageUrl,
        progress: allLessonIds.length > 0 ? Math.round((completedCount / allLessonIds.length) * 100) : 0,
        completedLessons: completedCount,
        totalLessons: allLessonIds.length,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        totalQuestions: total,
      };
    }));
  }
}
