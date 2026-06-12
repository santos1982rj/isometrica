import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestionStats(questionId: string) {
    const [attempts, alternatives] = await Promise.all([
      this.prisma.questionAttempt.findMany({
        where: { questionId },
        include: { user: { select: { id: true } } },
      }),
      this.prisma.alternative.findMany({
        where: { questionId },
      }),
    ]);

    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const avgTime = total > 0 ? attempts.reduce((a, b) => a + (b.timeSpent ?? 0), 0) / total : 0;

    // Alternative distribution
    const altCount: Record<string, { count: number; percentage: number }> = {};
    for (const alt of alternatives) {
      altCount[alt.id] = { count: 0, percentage: 0 };
    }
    attempts.forEach((a) => {
      if (a.selectedId && altCount[a.selectedId]) {
        altCount[a.selectedId].count++;
      }
    });
    if (total > 0) {
      for (const key of Object.keys(altCount)) {
        altCount[key].percentage = Math.round((altCount[key].count / total) * 100);
      }
    }

    const alternativeDistribution = alternatives.map((alt) => ({
      id: alt.id,
      text: alt.text,
      timesSelected: altCount[alt.id]?.count ?? 0,
      percentage: altCount[alt.id]?.percentage ?? 0,
    }));

    // Discrimination index (point-biserial correlation)
    let discrimination: number | null = null;
    if (total >= 10) {
      // Get proficiency for users who attempted this question
      const userIds = [...new Set(attempts.map((a) => a.userId))];
      const models = await this.prisma.studentModel.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, proficiency: true },
      });
      const profMap = new Map(models.map((m) => [m.userId, m.proficiency]));

      const scored: { proficiency: number; correct: number }[] = [];
      for (const a of attempts) {
        const prof = profMap.get(a.userId);
        if (prof !== undefined && a.userId) {
          scored.push({ proficiency: prof, correct: a.correct ? 1 : 0 });
        }
      }

      if (scored.length >= 10) {
        const n = scored.length;
        const meanProf = scored.reduce((s, r) => s + r.proficiency, 0) / n;
        const correctGroup = scored.filter((r) => r.correct === 1);
        const incorrectGroup = scored.filter((r) => r.correct === 0);
        if (correctGroup.length > 0 && incorrectGroup.length > 0) {
          const meanCorrect = correctGroup.reduce((s, r) => s + r.proficiency, 0) / correctGroup.length;
          const meanIncorrect = incorrectGroup.reduce((s, r) => s + r.proficiency, 0) / incorrectGroup.length;
          const sdProf = Math.sqrt(scored.reduce((s, r) => s + (r.proficiency - meanProf) ** 2, 0) / n);
          const p = correctGroup.length / n;
          const q = 1 - p;
          if (sdProf > 0) {
            discrimination = ((meanCorrect - meanIncorrect) / sdProf) * Math.sqrt(p * q);
            discrimination = Math.max(-1, Math.min(1, discrimination));
          }
        }
      }
    }

    return {
      totalAttempts: total,
      correctAttempts: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      avgTimeSeconds: Math.round(avgTime),
      discrimination: discrimination !== null ? Math.round(discrimination * 100) / 100 : null,
      alternativeDistribution,
    };
  }
}
