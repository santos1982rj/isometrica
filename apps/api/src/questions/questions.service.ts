import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuestionsService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const key = configService.get<string>('OPENAI_API_KEY');
    if (key) this.openai = new OpenAI({ apiKey: key });
  }

  // === QUESTÕES ===
  async list(filters: {
    search?: string; topicId?: string; examId?: string; difficulty?: string;
    type?: string; status?: string; tag?: string; board?: string; year?: string;
    page?: number; limit?: number;
  }) {
    const where: any = {};
    if (filters.search) where.text = { contains: filters.search, mode: 'insensitive' };
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.examId) where.examId = filters.examId;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.tag) where.tags = { some: { tag: filters.tag } };
    if (filters.board) where.exam = { board: filters.board };
    if (filters.year) where.exam = { ...where.exam, year: Number(filters.year) };

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where, skip, take: limit,
        include: { topic: { include: { subject: true } }, exam: true, alternatives: true, tags: true, stats: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: { topic: { include: { subject: true } }, exam: true, alternatives: true, tags: true, stats: true, comments: { include: { user: { select: { id: true, name: true, imageUrl: true } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!q) throw new NotFoundException('Questão não encontrada');
    return q;
  }

  async create(data: {
    text: string; type?: string; difficulty?: string; bloomLevel?: string;
    estimatedTime?: number; explanation?: string; resolutionUrl?: string;
    topicId: string; lessonId?: string; examId?: string;
    alternatives?: { text: string; isCorrect: boolean; feedback?: string }[];
    tags?: string[];
  }) {
    const question = await this.prisma.question.create({
      data: {
        text: data.text, type: (data.type as any) ?? 'MULTIPLA_ESCOLHA',
        difficulty: (data.difficulty as any) ?? 'MEDIUM',
        bloomLevel: (data.bloomLevel as any) ?? 'REMEMBER',
        estimatedTime: data.estimatedTime ?? 5,
        explanation: data.explanation, resolutionUrl: data.resolutionUrl,
        topicId: data.topicId, lessonId: data.lessonId, examId: data.examId,
        alternatives: data.alternatives ? { create: data.alternatives } : undefined,
        tags: data.tags ? { create: data.tags.map((t) => ({ tag: t })) } : undefined,
      },
      include: { topic: true, exam: true, alternatives: true, tags: true },
    });

    // Create stats record
    await this.prisma.questionStats.create({ data: { questionId: question.id } });
    return question;
  }

  async update(id: string, data: any) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Questão não encontrada');
    return this.prisma.question.update({ where: { id }, data, include: { topic: true, exam: true, alternatives: true, tags: true } });
  }

  async remove(id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { message: 'Questão removida' };
  }

  // === TAGS ===
  async getTags() {
    const tags = await this.prisma.questionTag.groupBy({ by: ['tag'], _count: { tag: true }, orderBy: { _count: { tag: 'desc' } }, take: 100 });
    return tags.map((t) => ({ tag: t.tag, count: t._count.tag }));
  }

  // === EXAMS ===
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

  // === ÁRVORE DE TÓPICOS ===
  async getTopicTree() {
    const subjects = await this.prisma.subject.findMany({
      include: { topics: { include: { _count: { select: { questions: true } } } } },
    });
    return subjects.map((s) => ({
      id: s.id, name: s.name, totalQuestions: s.topics.reduce((a, t) => a + t._count.questions, 0),
      children: s.topics.map((t) => ({ id: t.id, name: t.name, count: t._count.questions })),
    }));
  }

  // === ESTATÍSTICAS ===
  async getQuestionStats(questionId: string) {
    const attempts = await this.prisma.questionAttempt.findMany({ where: { questionId } });
    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const avgTime = total > 0 ? attempts.reduce((a, b) => a + (b.timeSpent ?? 0), 0) / total : 0;

    // Per-alternative distribution
    const altDistribution: Record<string, number> = {};
    attempts.forEach((a) => { if (a.selectedId) altDistribution[a.selectedId] = (altDistribution[a.selectedId] ?? 0) + 1; });

    return {
      totalAttempts: total, correctAttempts: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      avgTimeSeconds: Math.round(avgTime),
      alternativeDistribution: altDistribution,
    };
  }

  // === GERADOR COM IA ===
  async generateWithAI(topicId: string, count: number = 3, difficulty?: string) {
    if (!this.openai) throw new Error('OPENAI_API_KEY não configurada');

    const topic = await this.prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
    if (!topic) throw new NotFoundException('Tópico não encontrado');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Você é um professor de engenharia. Gere ${count} questões de múltipla escolha sobre "${topic.name}" (${topic.subject.name}). 
        Dificuldade: ${difficulty ?? 'variada'}. 
        Responda em JSON: [{ "text": "enunciado", "difficulty": "EASY|MEDIUM|HARD", "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE", "explanation": "explicação", "alternatives": [{ "text": "alternativa", "isCorrect": false, "feedback": "feedback opcional" }] }]`,
      }],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Falha ao gerar questões');

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);

    const created = [];
    for (const q of questions) {
      const question = await this.prisma.question.create({
        data: {
          text: q.text, difficulty: q.difficulty ?? 'MEDIUM', bloomLevel: q.bloomLevel ?? 'REMEMBER',
          explanation: q.explanation, topicId,
          alternatives: { create: q.alternatives?.map((a: any) => ({ text: a.text, isCorrect: a.isCorrect ?? false, feedback: a.feedback })) ?? [] },
        },
        include: { alternatives: true },
      });
      await this.prisma.questionStats.create({ data: { questionId: question.id } });
      created.push(question);
    }
    return created;
  }

  // === MODO CONCURSO ===
  async getExamSimulado(examId: string, limit: number = 10) {
    const questions = await this.prisma.question.findMany({
      where: { examId, status: 'PUBLICADA' },
      include: { alternatives: true, topic: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return questions;
  }

  // === DOMINAR TÓPICO ===
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
