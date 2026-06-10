import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { EventType } from '../../event-bus/interfaces/event.interface';

@Injectable()
export class AttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

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
      const interval = correct ? 1 : 0;
      const ease = correct ? 2.5 : 1.3;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + (interval || 1));
      return this.prisma.reviewSchedule.create({
        data: { userId, questionId, ease, interval, nextReview, lastReviewAt: new Date() },
      });
    }

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
}
