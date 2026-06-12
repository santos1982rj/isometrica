import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CONFIG } from '../common/config';

interface BktParams {
  prior: number;
  guess: number;
  slip: number;
  learnRate: number;
  timeBonus: number;
  hintPenalty: number;
}

const DEFAULT_BKT: BktParams = { ...CONFIG.bkt };

@Injectable()
export class StudentModelService {
  private readonly logger = new Logger(StudentModelService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateProficiency(params: {
    userId: string;
    topicId: string;
    correct: boolean;
    timeSpent?: number;
    hintUsed?: boolean;
  }): Promise<number> {
    const model = await this.prisma.studentModel.upsert({
      where: {
        userId_topicId: {
          userId: params.userId,
          topicId: params.topicId,
        },
      },
      create: {
        userId: params.userId,
        topicId: params.topicId,
        proficiency: DEFAULT_BKT.prior,
      },
      update: {},
    });

    const newProficiency = this.calculateBkt(model.proficiency, params, DEFAULT_BKT);

    await this.prisma.studentModel.update({
      where: { id: model.id },
      data: { proficiency: newProficiency },
    });

    return newProficiency;
  }

  async getStudentModel(userId: string) {
    return this.prisma.studentModel.findMany({
      where: { userId },
      include: { topic: { include: { subject: true } } },
      orderBy: { proficiency: 'asc' },
    });
  }

  async createDiagnostic(userId: string) {
    const models = await this.getStudentModel(userId);
    const snapshot = models.reduce(
      (acc, m) => ({
        ...acc,
        [m.topic.name]: { proficiency: m.proficiency, topicId: m.topicId, subject: m.topic.subject.name },
      }),
      {} as Record<string, { proficiency: number; topicId: string; subject: string }>,
    );

    return this.prisma.diagnostic.create({
      data: { userId, snapshot },
    });
  }

  private calculateBkt(current: number, attempt: { correct: boolean; timeSpent?: number; hintUsed?: boolean }, params: BktParams): number {
    const pKnown = current;
    const { correct, timeSpent, hintUsed } = attempt;

    const likelihood = correct
      ? pKnown * (1 - params.slip) + (1 - pKnown) * params.guess
      : pKnown * params.slip + (1 - pKnown) * (1 - params.guess);

    const pCorrect = correct
      ? (pKnown * (1 - params.slip)) / likelihood
      : (pKnown * params.slip) / likelihood;

    const pLearned = pCorrect + (1 - pCorrect) * params.learnRate;

    let adjustment = 0;

    if (correct && timeSpent !== undefined && timeSpent > 0) {
      const efficiency = Math.max(0, 1 - timeSpent / 120);
      adjustment += (efficiency - 0.5) * params.timeBonus;
    }

    if (hintUsed) {
      adjustment -= correct ? params.hintPenalty * 0.5 : params.hintPenalty;
    }

    const final = Math.max(0.01, Math.min(0.99, pLearned + adjustment));
    return Math.round(final * 1000) / 1000;
  }
}
