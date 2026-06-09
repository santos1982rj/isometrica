import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async createModule(courseId: string, data: { name: string; order: number }) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso não encontrado');
    return this.prisma.module.create({ data: { ...data, courseId } });
  }

  async updateModule(id: string, data: { name?: string; order?: number }) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Módulo não encontrado');
    return this.prisma.module.update({ where: { id }, data });
  }

  async removeModule(id: string) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Módulo não encontrado');
    await this.prisma.lesson.deleteMany({ where: { moduleId: id } });
    await this.prisma.module.delete({ where: { id } });
    return { message: 'Módulo removido' };
  }

  async createLesson(moduleId: string, data: { title: string; type: string; order: number; content?: string; videoUrl?: string; free?: boolean }) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException('Módulo não encontrado');
    const { videoUrl, materials, ...rest } = data as any;
    return this.prisma.lesson.create({ data: { ...rest, contentUrl: videoUrl, moduleId } });
  }

  async updateLesson(id: string, data: { title?: string; content?: string; videoUrl?: string }) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Aula não encontrada');
    const { videoUrl, ...rest } = data;
    return this.prisma.lesson.update({
      where: { id },
      data: videoUrl !== undefined ? { ...rest, contentUrl: videoUrl } : rest,
    });
  }

  async findLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: { include: { subject: true } },
            lessons: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    const moduleLessons = lesson.module.lessons;
    const currentIdx = moduleLessons.findIndex((l) => l.id === id);

    // Get the first user as course creator (mock for now, will be proper owner later)
    const creator = await this.prisma.user.findFirst({
      where: { role: 'PROFESSOR' },
      select: { id: true, name: true, imageUrl: true, title: true, bio: true, lattes: true, linkedin: true, instagram: true, twitter: true },
    });

    return {
      ...lesson,
      materials: lesson.materials ?? [],
      prevLessonId: currentIdx > 0 ? moduleLessons[currentIdx - 1].id : null,
      nextLessonId: currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1].id : null,
      moduleLessons,
      totalLessons: moduleLessons.length,
      currentLessonIndex: currentIdx + 1,
      professor: creator ?? { id: null, name: 'Professor', imageUrl: null, title: null, bio: null, lattes: null, linkedin: null, instagram: null, twitter: null },
    };
  }

  async findLessonQuestions(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: { include: { subject: { include: { topics: true } } } } } } },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    const topicIds = lesson.module.course.subject?.topics.map((t) => t.id) ?? [];
    if (topicIds.length === 0) return [];

    return this.prisma.question.findMany({
      where: { topicId: { in: topicIds } },
      include: { alternatives: true, topic: true },
    });
  }

  async createQuestion(data: {
    text: string
    topicId: string
    difficulty: string
    bloomLevel: string
    explanation?: string
    alternatives: { text: string; isCorrect: boolean }[]
  }) {
    return this.prisma.question.create({
      data: {
        text: data.text,
        topicId: data.topicId,
        difficulty: data.difficulty as any,
        bloomLevel: data.bloomLevel as any,
        explanation: data.explanation,
        alternatives: { create: data.alternatives },
      },
      include: { alternatives: true, topic: true },
    });
  }

  async removeLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Aula não encontrada');
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Aula removida' };
  }
}
