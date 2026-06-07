import { Injectable } from '@nestjs/common';
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

  findEnrollmentsByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
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
