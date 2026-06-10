import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async getTags() {
    const tags = await this.prisma.questionTag.groupBy({ by: ['tag'], _count: { tag: true }, orderBy: { _count: { tag: 'desc' } }, take: 100 });
    return tags.map((t) => ({ tag: t.tag, count: t._count.tag }));
  }

  async listExams(filters: { search?: string; board?: string }) {
    const where: any = {};
    if (filters.search) where.name = { contains: filters.search, mode: 'insensitive' };
    if (filters.board) where.board = filters.board;
    return this.prisma.exam.findMany({ where, include: { _count: { select: { questions: true } } }, orderBy: { name: 'asc' } });
  }

  async createExam(data: { name: string; board?: string; year?: number; role?: string; organization?: string }) {
    return this.prisma.exam.create({ data });
  }

  async getExamBoards() {
    const result = await this.prisma.exam.findMany({ select: { board: true }, distinct: ['board'], where: { board: { not: null } } });
    return result.map((r) => r.board).filter(Boolean);
  }

  async getExamSimulado(examId: string, limit: number = 10) {
    const questions = await this.prisma.question.findMany({
      where: { examId, status: 'PUBLICADA' },
      include: { alternatives: true, topic: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return questions;
  }

  async getTopicTree() {
    const subjects = await this.prisma.subject.findMany({
      include: { topics: { include: { _count: { select: { questions: true } } } } },
    });
    return subjects.map((s) => ({
      id: s.id, name: s.name, totalQuestions: s.topics.reduce((a, t) => a + t._count.questions, 0),
      children: s.topics.map((t) => ({ id: t.id, name: t.name, count: t._count.questions })),
    }));
  }

  async getTopicMastery(userId: string, topicId: string) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId, question: { topicId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    let consecutiveCorrect = 0;
    for (const a of attempts) {
      if (a.correct) consecutiveCorrect++;
      else consecutiveCorrect = 0;
    }

    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;

    return {
      topicId,
      totalAttempts: total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      consecutiveCorrect,
      targetToMaster: 10,
      isMastered: consecutiveCorrect >= 10,
      questionsNeeded: Math.max(0, 10 - consecutiveCorrect),
    };
  }
}
