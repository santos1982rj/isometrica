import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/enums';
import type { QuestionDifficulty, BloomLevel } from '../generated/prisma/enums';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCourseOwnerOrAdmin(courseId: string, userId: string, role: UserRole) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { professorId: true } });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (role !== UserRole.ADMIN && course.professorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para modificar este curso');
    }
  }

  private async assertModuleOwnerOrAdmin(moduleId: string, userId: string, role: UserRole) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true, course: { select: { professorId: true } } },
    });
    if (!mod) throw new NotFoundException('Módulo não encontrado');
    if (role !== UserRole.ADMIN && mod.course.professorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para modificar este módulo');
    }
  }

  private async assertLessonOwnerOrAdmin(lessonId: string, userId: string, role: UserRole) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { moduleId: true, module: { select: { courseId: true, course: { select: { professorId: true } } } } },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');
    if (role !== UserRole.ADMIN && lesson.module.course.professorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para modificar esta aula');
    }
  }

  private hideAnswerKey<T extends { alternatives?: Array<Record<string, unknown>>; explanation?: unknown }>(question: T): Omit<T, 'explanation'> {
    const { explanation: _explanation, ...safeQuestion } = question;
    if (!question.alternatives) return safeQuestion;
    return {
      ...safeQuestion,
      alternatives: question.alternatives.map(({ isCorrect: _isCorrect, ...alternative }) => alternative),
    };
  }

  async createModule(courseId: string, data: { name: string; order: number }, userId: string, role: UserRole) {
    await this.assertCourseOwnerOrAdmin(courseId, userId, role);
    return this.prisma.module.create({ data: { ...data, courseId } });
  }

  async updateModule(id: string, data: { name?: string; order?: number }, userId: string, role: UserRole) {
    await this.assertModuleOwnerOrAdmin(id, userId, role);
    return this.prisma.module.update({ where: { id }, data });
  }

  async removeModule(id: string, userId: string, role: UserRole) {
    await this.assertModuleOwnerOrAdmin(id, userId, role);
    await this.prisma.lesson.deleteMany({ where: { moduleId: id } });
    await this.prisma.module.delete({ where: { id } });
    return { message: 'Módulo removido' };
  }

  async createLesson(moduleId: string, data: { title: string; type: string; order: number; content?: string; contentUrl?: string; free?: boolean }, userId: string, role: UserRole) {
    await this.assertModuleOwnerOrAdmin(moduleId, userId, role);
    const { contentUrl, title, type, order, content, free } = data;
    return this.prisma.lesson.create({ data: { title, type, order, content, free, contentUrl, moduleId } });
  }

  async updateLesson(id: string, data: { title?: string; content?: string; contentUrl?: string }, userId: string, role: UserRole) {
    await this.assertLessonOwnerOrAdmin(id, userId, role);
    const { contentUrl, ...rest } = data;
    return this.prisma.lesson.update({
      where: { id },
      data: contentUrl !== undefined ? { ...rest, contentUrl } : rest,
    });
  }

  async findLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              include: { subject: true, professor: { select: { id: true, name: true, imageUrl: true, title: true, bio: true, lattes: true, linkedin: true, instagram: true, twitter: true } } },
            },
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        lessonMaterials: { orderBy: { order: 'asc' } },
      },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    const moduleLessons = lesson.module.lessons;
    const currentIdx = moduleLessons.findIndex((l) => l.id === id);
    const professor = lesson.module.course.professor;

    return {
      ...lesson,
      materials: lesson.materials ?? [],
      lessonMaterials: lesson.lessonMaterials,
      prevLessonId: currentIdx > 0 ? moduleLessons[currentIdx - 1].id : null,
      nextLessonId: currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1].id : null,
      moduleLessons,
      totalLessons: moduleLessons.length,
      currentLessonIndex: currentIdx + 1,
      professor: professor ?? { id: null, name: 'Professor', imageUrl: null, title: null, bio: null, lattes: null, linkedin: null, instagram: null, twitter: null },
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

    const questions = await this.prisma.question.findMany({
      where: { topicId: { in: topicIds } },
      include: { alternatives: true, topic: true },
    });
    return questions.map((question) => this.hideAnswerKey(question));
  }

  async createQuestion(data: {
    text: string
    topicId: string
    difficulty: QuestionDifficulty
    bloomLevel?: BloomLevel
    explanation?: string
    alternatives: { text: string; isCorrect: boolean }[]
  }) {
    return this.prisma.question.create({
      data: {
        text: data.text,
        topicId: data.topicId,
        difficulty: data.difficulty,
        bloomLevel: data.bloomLevel,
        explanation: data.explanation,
        alternatives: { create: data.alternatives },
      },
      include: { alternatives: true, topic: true },
    });
  }

  async removeLesson(id: string, userId: string, role: UserRole) {
    await this.assertLessonOwnerOrAdmin(id, userId, role);
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Aula removida' };
  }

  private async assertLessonMaterialOwnerOrAdmin(materialId: string, userId: string, role: UserRole) {
    const material = await this.prisma.lessonMaterial.findUnique({
      where: { id: materialId },
      select: { lessonId: true, lesson: { select: { moduleId: true, module: { select: { courseId: true, course: { select: { professorId: true } } } } } } },
    });
    if (!material) throw new NotFoundException('Material não encontrado');
    if (role !== UserRole.ADMIN && material.lesson.module.course.professorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para modificar este material');
    }
  }

  // LessonMaterial CRUD

  async createLessonMaterial(lessonId: string, data: { name: string; url: string; type?: string; order?: number }, userId: string, role: UserRole) {
    await this.assertLessonOwnerOrAdmin(lessonId, userId, role);
    return this.prisma.lessonMaterial.create({
      data: { lessonId, name: data.name, url: data.url, type: data.type, order: data.order ?? 0 },
    });
  }

  async updateLessonMaterial(id: string, data: { name?: string; url?: string; type?: string; order?: number }, userId: string, role: UserRole) {
    await this.assertLessonMaterialOwnerOrAdmin(id, userId, role);
    return this.prisma.lessonMaterial.update({ where: { id }, data });
  }

  async removeLessonMaterial(id: string, userId: string, role: UserRole) {
    await this.assertLessonMaterialOwnerOrAdmin(id, userId, role);
    await this.prisma.lessonMaterial.delete({ where: { id } });
    return { message: 'Material removido' };
  }
}
