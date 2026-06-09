import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { Response } from 'express';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured — using fallback responses');
    }
  }

  createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({ data: { userId, title } });
  }

  async addMessage(data: { conversationId: string; role: string; content: string }) {
    const msg = await this.prisma.message.create({ data });

    if (data.role === 'user' && this.openai) {
      const history = await this.prisma.message.findMany({
        where: { conversationId: data.conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é o Tutor IA da Isométrica, uma plataforma de engenharia. Responda em português claro e didático. Explique conceitos com exemplos práticos. Seja paciente e encorajador. Use linguagem técnica mas acessível. Quando apropriado, sugira exercícios ou materiais. Máximo 400 palavras.',
            },
            ...history.map((m) => ({
              role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.content,
            })),
          ],
          max_tokens: 600,
        });

        const reply = completion.choices[0]?.message?.content ?? 'Desculpe, não consegui processar sua pergunta. Tente novamente.';
        return this.prisma.message.create({
          data: { conversationId: data.conversationId, role: 'assistant', content: reply },
        });
      } catch (err) {
        this.logger.error('OpenAI API error', err);
        return this.fallbackResponse(data.conversationId);
      }
    }

    return msg;
  }

  async streamReply(conversationId: string, res: Response): Promise<string | null> {
    if (!this.openai) {
      const fallback = 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde.';
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
      return fallback;
    }

    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é o Tutor IA da Isométrica, uma plataforma de engenharia. Responda em português claro e didático. Explique conceitos com exemplos práticos. Seja paciente e encorajador. Use linguagem técnica mas acessível. Máximo 400 palavras.',
          },
          ...history.map((m) => ({
            role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          })),
        ],
        max_tokens: 600,
        stream: true,
      });

      let fullReply = '';

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
          fullReply += token;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return fullReply;
    } catch (err) {
      this.logger.error('OpenAI streaming error', err);
      const fallback = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return fallback;
    }
  }

  private async fallbackResponse(conversationId: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte.',
      },
    });
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
