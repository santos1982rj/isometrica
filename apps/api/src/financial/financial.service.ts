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

  async getAdminOverview() {
    const plans = await this.prisma.plan.findMany({ where: { active: true } });
    const subscriptions = await this.prisma.subscription.findMany({
      include: { plan: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'cancelled');
    const totalUsers = await this.prisma.user.count();

    const mrr = activeSubscriptions.reduce((sum, s) => sum + Number(s.plan.price), 0);
    const totalRevenue = subscriptions.reduce((sum, s) => sum + Number(s.plan.price), 0);
    const churnRate = subscriptions.length > 0
      ? Math.round((cancelledSubscriptions.length / subscriptions.length) * 100 * 10) / 10
      : 0;

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    const newSubsThisMonth = subscriptions.filter((s) => new Date(s.createdAt) >= firstOfMonth).length;

    // Plan distribution
    const planDistribution = plans.map((plan) => {
      const count = subscriptions.filter((s) => s.planId === plan.id).length;
      return { name: plan.name, count, price: Number(plan.price) };
    });
    const freeUsers = totalUsers - subscriptions.length;
    planDistribution.push({ name: 'Sem assinatura', count: Math.max(0, freeUsers), price: 0 });

    // Recent payments (subscriptions created as proxy for payments)
    const recentPayments = subscriptions.slice(0, 10).map((s) => ({
      id: s.id,
      userName: s.user?.name ?? 'Usuário',
      userEmail: s.user?.email ?? '',
      planName: s.plan.name,
      amount: Number(s.plan.price),
      date: s.createdAt,
      status: s.status,
    }));

    return {
      overview: {
        mrr,
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue,
        churnRate,
        totalSubscriptions: subscriptions.length,
        newSubscriptionsThisMonth: newSubsThisMonth,
      },
      planDistribution,
      recentPayments,
    };
  }
}
