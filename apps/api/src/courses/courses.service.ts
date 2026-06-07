import { Injectable } from '@nestjs/common';
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
      include: { subject: true, modules: { include: { lessons: true } } },
    });
  }
}
