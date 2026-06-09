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

    const allCourseLessonIds = courses.map((c) => ({
      id: c.id,
      lessonIds: c.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    }));
    const completedCounts = await this.prisma.lessonProgress.groupBy({
      by: ['lessonId'],
      where: { lessonId: { in: allCourseLessonIds.flatMap((c) => c.lessonIds) }, completed: true },
      _count: { lessonId: true },
    });
    const completedByLesson = new Map(completedCounts.map((r) => [r.lessonId, r._count.lessonId]));

    const courseStats = courses.map((course) => {
      const cLessonIds = allCourseLessonIds.find((c) => c.id === course.id)!.lessonIds;
      const completedLessons = cLessonIds.reduce((sum, lid) => sum + (completedByLesson.get(lid) ?? 0), 0);
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
    });

    const totalAttempts = attempts.reduce((a, r) => a + r._count.id, 0);
    const correctAttempts = attempts.filter((r) => r.correct).reduce((a, r) => a + r._count.id, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Students needing attention (low accuracy, < 50%)
    const uniqueUserIds = [...new Set(attempts.map((a) => a.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name ?? 'Unknown']));

    const studentAccuracy: Record<string, { total: number; correct: number; name: string }> = {};
    for (const a of attempts) {
      if (!studentAccuracy[a.userId]) {
        studentAccuracy[a.userId] = { total: 0, correct: 0, name: userMap.get(a.userId) ?? 'Unknown' };
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

    const userIds = enrollments.map((e) => e.user.id);
    const [progressCounts, userAttempts] = await Promise.all([
      this.prisma.lessonProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, lessonId: { in: allLessonIds }, completed: true },
        _count: { lessonId: true },
      }),
      this.prisma.questionAttempt.groupBy({
        by: ['userId', 'correct'],
        where: { userId: { in: userIds } },
        _count: { id: true },
      }),
    ]);
    const progressMap = new Map(progressCounts.map((p) => [p.userId, p._count.lessonId]));
    const attemptMap = new Map<string, { total: number; correct: number }>();
    for (const a of userAttempts) {
      if (!attemptMap.has(a.userId)) attemptMap.set(a.userId, { total: 0, correct: 0 });
      const entry = attemptMap.get(a.userId)!;
      entry.total += a._count.id;
      if (a.correct) entry.correct += a._count.id;
    }

    return enrollments.map((e) => {
      const completedCount = progressMap.get(e.user.id) ?? 0;
      const stats = attemptMap.get(e.user.id) ?? { total: 0, correct: 0 };
      return {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        imageUrl: e.user.imageUrl,
        progress: allLessonIds.length > 0 ? Math.round((completedCount / allLessonIds.length) * 100) : 0,
        completedLessons: completedCount,
        totalLessons: allLessonIds.length,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        totalQuestions: stats.total,
      };
    });
  }
}
