import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventType } from '../generated/prisma/enums';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  trackEvent(userId: string, type: EventType, metadata?: Record<string, unknown>) {
    return this.prisma.event.create({ data: { userId, type, metadata: metadata as Prisma.InputJsonValue } });
  }

  getUserEvents(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  getEventSummary() {
    return this.prisma.event.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
  }
}
