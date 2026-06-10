import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from '../financial.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FinancialService', () => {
  let service: FinancialService;
  let prisma: any;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const mockPlans = [
    { id: 'plan-1', name: 'Premium Mensal', description: null, price: 29.90, active: true },
    { id: 'plan-2', name: 'Premium Anual', description: null, price: 239.90, active: true },
  ];

  const mockSubscriptions = [
    { id: 'sub-1', userId: 'u1', planId: 'plan-1', status: 'active', createdAt: new Date(Date.now() - 86400000).toISOString(), plan: mockPlans[0], user: { name: 'Ana', email: 'ana@email.com' } },
    { id: 'sub-2', userId: 'u2', planId: 'plan-1', status: 'active', createdAt: new Date(Date.now() - 172800000).toISOString(), plan: mockPlans[0], user: { name: 'Beto', email: 'beto@email.com' } },
    { id: 'sub-3', userId: 'u3', planId: 'plan-2', status: 'active', createdAt: firstOfMonth.toISOString(), plan: mockPlans[1], user: { name: 'Carla', email: 'carla@email.com' } },
    { id: 'sub-4', userId: 'u4', planId: 'plan-1', status: 'cancelled', createdAt: new Date(Date.now() - 259200000).toISOString(), plan: mockPlans[0], user: { name: 'Daniel', email: 'daniel@email.com' } },
    { id: 'sub-5', userId: 'u5', planId: 'plan-2', status: 'active', createdAt: new Date(Date.now() - 345600000).toISOString(), plan: mockPlans[1], user: { name: 'Eduarda', email: 'eduarda@email.com' } },
  ];

  const mockPrisma = {
    plan: {
      findMany: vi.fn().mockResolvedValue(mockPlans),
    },
    subscription: {
      findMany: vi.fn().mockResolvedValue(mockSubscriptions),
      create: vi.fn().mockResolvedValue({ id: 'sub-new' }),
    },
    user: {
      count: vi.fn().mockResolvedValue(100),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new FinancialService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminOverview', () => {
    it('should calculate MRR correctly', async () => {
      const result = await service.getAdminOverview();

      // 4 active subs: 2 x R$29.90 + 2 x R$239.90
      const expectedMrr = 2 * 29.90 + 2 * 239.90;
      expect(result.overview.mrr).toBeCloseTo(expectedMrr, 1);
    });

    it('should count active subscriptions', async () => {
      const result = await service.getAdminOverview();
      expect(result.overview.activeSubscriptions).toBe(4);
    });

    it('should calculate churn rate', async () => {
      const result = await service.getAdminOverview();
      // 1 cancelled out of 5 total
      expect(result.overview.churnRate).toBe(20);
    });

    it('should include plan distribution', async () => {
      const result = await service.getAdminOverview();

      expect(result.planDistribution).toHaveLength(3); // 2 plans + "Sem assinatura"
      const premiumMensal = result.planDistribution.find((p) => p.name === 'Premium Mensal');
      expect(premiumMensal?.count).toBe(3);
      expect(premiumMensal?.price).toBe(29.90);

      const semAssinatura = result.planDistribution.find((p) => p.name === 'Sem assinatura');
      expect(semAssinatura).toBeDefined();
      expect(semAssinatura!.count).toBe(95); // 100 users - 5 subscriptions
    });

    it('should return recent payments', async () => {
      const result = await service.getAdminOverview();

      expect(result.recentPayments).toHaveLength(5);
      expect(result.recentPayments[0].userName).toBe('Ana');
      expect(result.recentPayments[0].planName).toBe('Premium Mensal');
    });
  });

  describe('findAllPlans', () => {
    it('should return active plans', async () => {
      const result = await service.findAllPlans();
      expect(result).toEqual(mockPlans);
      expect(mockPrisma.plan.findMany).toHaveBeenCalledWith({ where: { active: true } });
    });
  });

  describe('subscribe', () => {
    it('should create a subscription', async () => {
      const result = await service.subscribe({ userId: 'u6', planId: 'plan-1' });
      expect(result).toEqual({ id: 'sub-new' });
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({ data: { userId: 'u6', planId: 'plan-1' } });
    });
  });
});
