import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionCrudService {
  constructor(private readonly prisma: PrismaService) {}

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
}
