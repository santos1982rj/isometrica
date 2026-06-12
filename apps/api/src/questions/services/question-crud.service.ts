import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { QuestionType, QuestionDifficulty, BloomLevel, QuestionStatus } from '../../generated/prisma/enums';
import type { QuestionWhereInput, QuestionOrderByWithRelationInput, QuestionUpdateInput } from '../../generated/prisma/models';

@Injectable()
export class QuestionCrudService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: {
    search?: string; topicId?: string; examId?: string; difficulty?: string;
    type?: string; status?: string; tag?: string; board?: string; year?: string;
    bloomLevel?: string; dateFrom?: string; dateTo?: string; sort?: string;
    page?: number; limit?: number;
  }) {
    const where: QuestionWhereInput = {};
    if (filters.search) where.text = { contains: filters.search, mode: 'insensitive' };
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.examId) where.examId = filters.examId;
    if (filters.difficulty) where.difficulty = filters.difficulty as QuestionDifficulty;
    if (filters.type) where.type = filters.type as QuestionType;
    if (filters.status) where.status = filters.status as QuestionStatus;
    if (filters.bloomLevel) where.bloomLevel = filters.bloomLevel as BloomLevel;
    if (filters.tag) where.tags = { some: { tag: filters.tag } };
    if (filters.board || filters.year) where.exam = { ...(filters.board ? { board: filters.board } : {}), ...(filters.year ? { year: Number(filters.year) } : {}) };
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    let orderBy: QuestionOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sort === 'recent') orderBy = { createdAt: 'desc' };
    else if (filters.sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (filters.sort === 'difficulty_desc') orderBy = { difficulty: 'desc' };
    else if (filters.sort === 'difficulty_asc') orderBy = { difficulty: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where, skip, take: limit,
        include: { topic: { include: { subject: true } }, exam: true, alternatives: true, tags: true, stats: true },
        orderBy,
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
        text: data.text, type: (data.type ?? 'MULTIPLA_ESCOLHA') as QuestionType,
        difficulty: (data.difficulty ?? 'MEDIUM') as QuestionDifficulty,
        bloomLevel: (data.bloomLevel ?? 'REMEMBER') as BloomLevel,
        estimatedTime: data.estimatedTime ?? 5,
        explanation: data.explanation, resolutionUrl: data.resolutionUrl,
        topicId: data.topicId, lessonId: data.lessonId, examId: data.examId,
        alternatives: data.alternatives ? { create: data.alternatives } : undefined,
        tags: data.tags ? { create: data.tags.map((t) => ({ tag: t })) } : undefined,
      },
      include: { topic: true, exam: true, alternatives: true, tags: true },
    });

    await this.prisma.questionStats.create({ data: { questionId: question.id } });
    return question;
  }

  async update(id: string, data: Record<string, unknown>) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Questão não encontrada');
    return this.prisma.question.update({ where: { id }, data: data as QuestionUpdateInput, include: { topic: true, exam: true, alternatives: true, tags: true } });
  }

  async remove(id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { message: 'Questão removida' };
  }
}
