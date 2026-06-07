import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

  findAllPlans() {
    return this.prisma.plan.findMany({ where: { active: true } });
  }

  subscribe(data: { userId: string; planId: string }) {
    return this.prisma.subscription.create({ data });
  }

  getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
    });
  }
}
