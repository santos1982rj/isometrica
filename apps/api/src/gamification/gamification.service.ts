import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.gamificationProfile.findUnique({
      where: { userId },
      include: { achievements: true, missions: true },
    });
  }

  addXp(userId: string, amount: number) {
    return this.prisma.gamificationProfile.update({
      where: { userId },
      data: { xp: { increment: amount } },
    });
  }
}
