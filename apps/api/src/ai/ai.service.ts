import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({ data: { userId, title } });
  }

  addMessage(data: { conversationId: string; role: string; content: string }) {
    return this.prisma.message.create({ data });
  }

  getConversation(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  createRecommendation(data: { userId: string; title: string; type: string; description?: string; link?: string }) {
    return this.prisma.recommendation.create({ data });
  }

  getUserRecommendations(userId: string) {
    return this.prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
