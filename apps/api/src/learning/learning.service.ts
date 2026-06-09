import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { EventType } from '../event-bus/interfaces/event.interface';
import { StudentModelService } from './student-model.service';

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly studentModel: StudentModelService,
  ) {}

  async enrollUser(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.create({ data: { userId, courseId }, include: { course: true } });

    await this.eventBus.publish({
      type: EventType.ENROLLMENT_CREATED,
      userId,
      timestamp: new Date(),
      metadata: { courseId, courseName: enrollment.course.name },
    });

    return enrollment;
  }

  async checkEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    return { enrolled: !!enrollment, enrollment };
  }

  findEnrollmentsByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
  }

  async markProgress(userId: string, lessonId: string, completed: boolean) {
    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, progress: completed ? 100 : 0 },
      create: { userId, lessonId, completed, progress: completed ? 100 : 0 },
    });

    if (completed) {
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

  async generateCertificate(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { include: { lessons: true } }, subject: true },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.certificateEnabled) {
      throw new BadRequestException('Este curso não oferece certificado');
    }

    const progress = await this.getCourseProgress(userId, courseId);
    if (progress.percentage < 100) {
      throw new BadRequestException('Complete todas as aulas para obter o certificado');
    }

    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId, question: { topic: { subjectId: course.subjectId ?? undefined } } },
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

    // Prioritize by lowest proficiency topics
    const model = await this.getStudentModel(userId);
    const lowTopics = model?.filter((m: any) => m.proficiency < 0.5) ?? [];

    // Sort: courses with low proficiency topics first
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

  async submitAttempt(data: {
    userId: string;
    questionId: string;
    selectedId: string;
    correct: boolean;
    timeSpent?: number;
    hintUsed?: boolean;
  }) {
    const attempt = await this.prisma.questionAttempt.create({ data, include: { question: true } });

    const eventType = data.correct ? EventType.QUESTION_CORRECT : EventType.QUESTION_INCORRECT;

    await this.eventBus.publish({
      type: eventType,
      userId: data.userId,
      timestamp: new Date(),
      metadata: {
        questionId: data.questionId,
        topicId: attempt.question.topicId,
        correct: data.correct,
        timeSpent: data.timeSpent ?? 0,
        hintUsed: data.hintUsed ?? false,
      },
    });

    return attempt;
  }

  // === SM-2 SPACED REPETITION ===
  async getReviewQuestions(userId: string) {
    const now = new Date();
    const schedules = await this.prisma.reviewSchedule.findMany({
      where: { userId, nextReview: { lte: now } },
      include: { question: { include: { alternatives: true, topic: true } } },
      orderBy: { nextReview: 'asc' },
      take: 20,
    });
    return schedules.map((s) => ({ id: s.id, question: s.question, nextReview: s.nextReview, ease: s.ease }));
  }

  async answerReview(userId: string, questionId: string, correct: boolean) {
    const schedule = await this.prisma.reviewSchedule.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (!schedule) {
      // First review
      const interval = correct ? 1 : 0;
      const ease = correct ? 2.5 : 1.3;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + (interval || 1));
      return this.prisma.reviewSchedule.create({
        data: { userId, questionId, ease, interval, nextReview, lastReviewAt: new Date() },
      });
    }

    // SM-2 algorithm
    let { ease, interval } = schedule;
    if (correct) {
      if (interval === 0) interval = 1;
      else if (interval === 1) interval = 3;
      else interval = Math.round(interval * ease);
      ease = Math.min(ease + 0.1, 3.0);
    } else {
      interval = 0;
      ease = Math.max(ease - 0.2, 1.3);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await this.prisma.questionAttempt.create({ data: { userId, questionId, selectedId: '', correct } });

    return this.prisma.reviewSchedule.update({
      where: { userId_questionId: { userId, questionId } },
      data: { ease, interval, nextReview, lastReviewAt: new Date() },
    });
  }

  async getUserErrors(userId: string) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId, correct: false },
      include: {
        question: { include: { alternatives: true, topic: { include: { subject: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by question to avoid duplicates
    const seen = new Set<string>()
    return attempts.filter((a) => {
      if (seen.has(a.questionId)) return false
      seen.add(a.questionId)
      return true
    });
  }

  async clearUserErrors(userId: string) {
    await this.prisma.questionAttempt.deleteMany({ where: { userId, correct: false } });
    return { message: 'Histórico de erros limpo' };
  }

  getStudentModel(userId: string) {
    return this.studentModel.getStudentModel(userId);
  }

  getDiagnostics(userId: string) {
    return this.prisma.diagnostic.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDiagnostic(userId: string) {
    return this.studentModel.createDiagnostic(userId);
  }
}
