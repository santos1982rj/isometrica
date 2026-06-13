import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { EventType } from '../../event-bus/interfaces/event.interface';
import { StudentModelService } from '../student-model.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly studentModel: StudentModelService,
  ) {}

  async markProgress(userId: string, lessonId: string, completed: boolean) {
    const existing = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    // Only publish LESSON_COMPLETED on first transition to completed
    const isNewCompletion = completed && (!existing || !existing.completed);

    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, progress: completed ? 100 : 0 },
      create: { userId, lessonId, completed, progress: completed ? 100 : 0 },
    });

    if (isNewCompletion) {
      await this.eventBus.publish({
        type: EventType.LESSON_COMPLETED,
        userId,
        timestamp: new Date(),
        metadata: { lessonId },
      });
    }

    return progress;
  }

  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { include: { lessons: true } } },
    });
    if (!course) return { total: 0, completed: 0, percentage: 0 };

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completed = await this.prisma.lessonProgress.count({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
    });

    return {
      total: lessonIds.length,
      completed,
      percentage: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
    };
  }

  async getNextLessons(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    const allLessonIds = enrollments.flatMap((e) =>
      e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    );
    const completedProgress = await this.prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
      select: { lessonId: true },
    });
    const completedIds = new Set(completedProgress.map((p) => p.lessonId));

    const result = []
    for (const enrollment of enrollments) {
      const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
      const courseCompletedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
      const nextLesson = allLessons.find((l) => !completedIds.has(l.id));

      if (nextLesson) {
        const pct = allLessons.length > 0 ? Math.round((courseCompletedCount / allLessons.length) * 100) : 0;
        result.push({
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          lessonId: nextLesson.id,
          lessonTitle: nextLesson.title,
          type: nextLesson.type,
          progress: pct,
          totalLessons: allLessons.length,
          completedLessons: courseCompletedCount,
        });
      }
    }

    const model = await this.studentModel.getStudentModel(userId);
    const lowTopics = model?.filter((m) => m.proficiency < 0.5) ?? [];

    result.sort((a, b) => a.progress - b.progress);

    return { nextLessons: result.slice(0, 5), topicsToReview: lowTopics.slice(0, 5) };
  }

  async getWeekPlan(userId: string) {
    const next = await this.getNextLessons(userId);
    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    const plan = weekDays.map((day, i) => ({
      day,
      lesson: i < next.nextLessons.length ? next.nextLessons[i] : null,
      completed: false,
    }));
    return { plan, stats: { total: next.nextLessons.length, thisWeek: Math.min(next.nextLessons.length, 5) } };
  }

  async saveNote(userId: string, lessonId: string, notes: string) {
    return this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { notes },
      create: { userId, lessonId, notes },
    });
  }

  async getNote(userId: string, lessonId: string) {
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return { notes: progress?.notes ?? '' };
  }
}
