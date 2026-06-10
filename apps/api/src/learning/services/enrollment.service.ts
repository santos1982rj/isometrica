import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { EventType } from '../../event-bus/interfaces/event.interface';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async enrollUser(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.create({ data: { userId, courseId }, include: { course: true } });

    await this.eventBus.publish({
      type: EventType.ENROLLMENT_CREATED,
      userId,
      timestamp: new Date(),
      metadata: { courseId, courseName: enrollment.course.name },
    });

    return enrollment;
  }

  async checkEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    return { enrolled: !!enrollment, enrollment };
  }

  findEnrollmentsByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
  }
}
