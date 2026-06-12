import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto } from '../dto/create-exam.dto';
import { UpdateExamDto } from '../dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async getTags() {
    const tags = await this.prisma.questionTag.groupBy({ by: ['tag'], _count: { tag: true }, orderBy: { _count: { tag: 'desc' } }, take: 100 });
    return tags.map((t) => ({ tag: t.tag, count: t._count.tag }));
  }

  async listExams(filters: { search?: string; board?: string; area?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (filters.search) where.name = { contains: filters.search, mode: 'insensitive' };
    if (filters.board) where.board = filters.board;
    if (filters.area) where.area = filters.area;

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({
        where, skip, take: limit,
        include: { _count: { select: { questions: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      data: data.map(e => ({
        id: e.id,
        title: e.name,
        description: null,
        board: e.board ?? '',
        year: e.year?.toString() ?? null,
        questionCount: e._count.questions,
        createdAt: e.createdAt.toISOString(),
        difficulty: e.difficulty,
        area: e.area,
        timeLimit: e.timeLimit,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createExam(dto: CreateExamDto) {
    const { questionIds, ...data } = dto;
    return this.prisma.exam.create({
      data: {
        ...data,
        ...(questionIds?.length ? { questions: { connect: questionIds.map(id => ({ id })) } } : {}),
      },
      include: { _count: { select: { questions: true } } },
    });
  }

  async getExamById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: { alternatives: true, topic: { include: { subject: true } } },
        },
        _count: { select: { questions: true } },
      },
    });
    if (!exam) throw new NotFoundException('Exame não encontrado');
    return exam as any;
  }

  async updateExam(id: string, dto: UpdateExamDto) {
    const { questionIds, ...data } = dto;
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exame não encontrado');

    return this.prisma.exam.update({
      where: { id },
      data: {
        ...data,
        ...(questionIds !== undefined
          ? { questions: { set: questionIds.map(id => ({ id })) } }
          : {}),
      },
      include: { _count: { select: { questions: true } } },
    });
  }

  async deleteExam(id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exame não encontrado');
    // Desassociate questions first
    await this.prisma.exam.update({
      where: { id },
      data: { questions: { set: [] } },
    });
    return this.prisma.exam.delete({ where: { id } });
  }

  async getExamBoards() {
    const result = await this.prisma.exam.findMany({ select: { board: true }, distinct: ['board'], where: { board: { not: null } } });
    return result.map((r) => r.board).filter((b): b is string => b !== null);
  }

  async getExamSimulado(examId: string, limit: number = 10) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exame não encontrado');

    const questions = await this.prisma.question.findMany({
      where: { examId, status: 'PUBLICADA' },
      include: { alternatives: true, topic: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      exam: { id: exam.id, title: exam.name, timeLimit: exam.timeLimit },
      questions,
      totalQuestions: questions.length,
      timeLimit: exam.timeLimit,
    };
  }

  async startSimulado(userId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          where: { status: 'PUBLICADA' },
          include: { alternatives: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exame não encontrado');
    if (exam.questions.length === 0) throw new BadRequestException('Exame não possui questões publicadas');

    const session = await this.prisma.simuladoSession.create({
      data: {
        userId,
        examId,
        totalQuestions: exam.questions.length,
      },
    });

    await this.prisma.simuladoAnswer.createMany({
      data: exam.questions.map(q => ({ sessionId: session.id, questionId: q.id })),
    });

    return {
      sessionId: session.id,
      exam: { id: exam.id, name: exam.name, timeLimit: exam.timeLimit },
      totalQuestions: exam.questions.length,
      questions: exam.questions.map(q => ({
        questionId: q.id,
        text: q.text,
        difficulty: q.difficulty,
        topic: q.topicId,
        alternatives: q.alternatives.map(alt => ({
          id: alt.id, text: alt.text,
        })),
      })),
      startedAt: session.startedAt,
    };
  }

  async submitSimulado(sessionId: string, userId: string, answers: { questionId: string; selectedId: string | null; timeSpent: number }[]) {
    const session = await this.prisma.simuladoSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    if (session.userId !== userId) throw new NotFoundException();
    if (session.status !== 'em_andamento') throw new BadRequestException('Simulado já finalizado');

    const allAnswers = await this.prisma.simuladoAnswer.findMany({
      where: { sessionId },
      include: { question: { include: { alternatives: true } } },
    });

    let correct = 0;
    for (const answer of answers) {
      const questionData = allAnswers.find(a => a.questionId === answer.questionId)?.question;
      if (!questionData) continue;
      const isCorrect = answer.selectedId
        ? questionData.alternatives.find(a => a.id === answer.selectedId)?.isCorrect ?? false
        : false;
      if (isCorrect) correct++;

      await this.prisma.simuladoAnswer.updateMany({
        where: { sessionId, questionId: answer.questionId },
        data: { selectedId: answer.selectedId, correct: isCorrect, timeSpent: answer.timeSpent },
      });
    }

    const totalQuestions = session.totalQuestions ?? allAnswers.length;
    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    await this.prisma.simuladoSession.update({
      where: { id: sessionId },
      data: { status: 'concluido', score, totalCorrect: correct, finishedAt: new Date() },
    });

    return this.getSimuladoResult(sessionId);
  }

  async getSimuladoResult(sessionId: string) {
    const answers = await this.prisma.simuladoAnswer.findMany({
      where: { sessionId },
      include: {
        question: {
          include: { alternatives: true, topic: { include: { subject: true } } },
        },
      },
    });

    const session = await this.prisma.simuladoSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException();

    const questions = answers.map(a => ({
      questionId: a.question.id,
      text: a.question.text,
      explanation: a.question.explanation,
      difficulty: a.question.difficulty,
      topic: a.question.topic?.name,
      subject: a.question.topic?.subject?.name,
      alternatives: a.question.alternatives.map(alt => ({
        id: alt.id, text: alt.text, isCorrect: alt.isCorrect,
      })),
      selectedId: a.selectedId,
      correct: a.correct,
      timeSpent: a.timeSpent,
    }));

    return {
      sessionId: session.id,
      examId: session.examId,
      score: session.score,
      totalCorrect: session.totalCorrect,
      totalQuestions: session.totalQuestions,
      status: session.status,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      questions,
    };
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
