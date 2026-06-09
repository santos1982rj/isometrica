import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({ include: { subject: true, modules: true } });
  }

  findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { subject: true, modules: { include: { lessons: { orderBy: { order: 'asc' } } } } },
    });
  }

  async create(data: { name: string; description: string; category?: string; imageUrl?: string; color?: string; estimatedHours?: number; level?: string; premium?: boolean; certificateEnabled?: boolean; price?: number }) {
    let subjectId: string | undefined = undefined;

    if (data.category) {
      const subject = await this.prisma.subject.upsert({
        where: { name: data.category },
        update: {},
        create: { name: data.category, description: `Cursos de ${data.category}` },
      });
      subjectId = subject.id;
    }

    return this.prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        subjectId: subjectId,
      },
      include: { subject: true },
    });
  }

  async update(id: string, data: { name?: string; description?: string; imageUrl?: string; category?: string }) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso não encontrado');

    let subjectId = course.subjectId;
    if (data.category) {
      const subject = await this.prisma.subject.upsert({
        where: { name: data.category },
        update: {},
        create: { name: data.category, description: `Cursos de ${data.category}` },
      });
      subjectId = subject.id;
    }

    return this.prisma.course.update({
      where: { id },
      data: { ...data, subjectId },
      include: { subject: true, modules: { include: { lessons: { orderBy: { order: 'asc' } } } } },
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso não encontrado');
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Curso removido' };
  }

  async searchCourses(q: string) {
    return this.prisma.course.findMany({
      where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
      take: 5,
    });
  }

  async searchModules(q: string) {
    return this.prisma.module.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { course: { select: { id: true, name: true } } },
      take: 5,
    });
  }

  async searchLessons(q: string) {
    return this.prisma.lesson.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      include: { module: { include: { course: { select: { id: true, name: true } } } } },
      take: 5,
    });
  }

  async purchaseCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.premium) throw new ConflictException('Este curso não requer compra avulsa');

    const existing = await this.prisma.purchase.findFirst({
      where: { userId, itemType: 'course', itemId: courseId },
    });
    if (existing) throw new ConflictException('Você já comprou este curso');

    const purchase = await this.prisma.purchase.create({
      data: { userId, itemType: 'course', itemId: courseId, amount: course.price },
    });

    // Auto-enroll
    await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });

    return { purchase, enrolled: true };
  }

  async checkAccess(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso não encontrado');

    // Free courses: access via enrollment only
    if (!course.premium) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { userId, courseId },
      });
      return { hasAccess: !!enrollment, needsPurchase: false };
    }

    // Premium courses: check purchase or subscription
    const [purchase, subscription] = await Promise.all([
      this.prisma.purchase.findFirst({
        where: { userId, itemType: 'course', itemId: courseId },
      }),
      this.prisma.subscription.findFirst({
        where: { userId, status: 'active' },
      }),
    ]);

    const hasAccess = !!purchase || !!subscription;

    return {
      hasAccess,
      needsPurchase: !hasAccess,
      price: hasAccess ? 0 : Number(course.price),
      premium: course.premium,
      certificateEnabled: course.certificateEnabled,
    };
  }
}
