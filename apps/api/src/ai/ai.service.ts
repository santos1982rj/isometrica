import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { Response } from 'express';

const SYSTEM_PROMPT = `Você é o Tutor IA da Isométrica, uma plataforma de ensino de Engenharia.

## TAREFAS PERMITIDAS
- Explicar conceitos de engenharia (civil, mecânica, elétrica, computação, etc.)
- Resolver exercícios técnicos passo a passo
- Sugerir materiais de estudo, livros, videoaulas
- Recomendar tópicos para revisar com base em dificuldades
- Responder perguntas sobre cálculo, física, resistência dos materiais, estruturas, hidráulica, solos, etc.

## REGRAS
- Responda APENAS sobre Engenharia, Matemática, Física e ciências exatas aplicadas.
- Se o usuário perguntar algo FORA desses tópicos (receitas, entretenimento, política, programação, opinião), recuse educadamente e redirecione para engenharia.
- NÃO gere receitas, NÃO escreva código, NÃO dê opiniões pessoais.
- NÃO finja ser humano. Diga sempre "Tutor IA" quando referir a si mesmo.
- Seja didático: use exemplos práticos do dia a dia da engenharia.
- Máximo de 400 palavras por resposta.
- Use português claro e acessível. Evite jargão desnecessário.
- Se o aluno estiver errado, corrija com gentileza.`;

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
      this.logger.log(`Groq client initialized (model: ${GROQ_MODEL})`);
    } else {
      this.logger.warn('GROQ_API_KEY not configured — using fallback responses');
    }
  }

  createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({ data: { userId, title } });
  }

  async addMessage(data: { conversationId: string; role: string; content: string }) {
    return this.prisma.message.create({ data });
  }

  async streamReply(conversationId: string, res: Response): Promise<string | null> {
    if (!this.client) {
      const fallback = 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde.';
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return fallback;
    }

    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (history.length === 0) {
      const fallback = 'Nenhuma mensagem encontrada.';
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return fallback;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
      return fullReply || null;
    } catch (err) {
      this.logger.error('Groq streaming error', err);
      const fallback = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return fallback;
    }
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
