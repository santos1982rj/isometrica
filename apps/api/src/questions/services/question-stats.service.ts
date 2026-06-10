import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestionStats(questionId: string) {
    const attempts = await this.prisma.questionAttempt.findMany({ where: { questionId } });
    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const avgTime = total > 0 ? attempts.reduce((a, b) => a + (b.timeSpent ?? 0), 0) / total : 0;

    const altDistribution: Record<string, number> = {};
    attempts.forEach((a) => { if (a.selectedId) altDistribution[a.selectedId] = (altDistribution[a.selectedId] ?? 0) + 1; });

    return {
      totalAttempts: total, correctAttempts: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      avgTimeSeconds: Math.round(avgTime),
      alternativeDistribution: altDistribution,
    };
  }
}
