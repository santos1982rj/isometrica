import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CONFIG } from '../../common/config';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import type { QuestionType, QuestionDifficulty, BloomLevel } from '../../generated/prisma/enums';

@Injectable()
export class QuestionGeneratorService {
  private client: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const key = configService.get<string>('GROQ_API_KEY');
    if (key) this.client = new OpenAI({ apiKey: key, baseURL: CONFIG.groq.baseUrl });
  }

  async generateWithAI(topicId: string, count: number = 3, difficulty?: string, userId?: string) {
    if (!this.client) throw new Error('GROQ_API_KEY não configurada');

    const topic = await this.prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
    if (!topic) throw new NotFoundException('Tópico não encontrado');

    const completion = await this.client.chat.completions.create({
      model: CONFIG.groq.model,
      messages: [{
        role: 'system',
        content: `Você é um professor de engenharia. Gere ${count} questões de múltipla escolha sobre "${topic.name}" (${topic.subject.name}). 
        Dificuldade: ${difficulty ?? 'variada'}. 
        Responda em JSON: [{ "text": "enunciado", "difficulty": "EASY|MEDIUM|HARD", "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE", "explanation": "explicação", "alternatives": [{ "text": "alternativa", "isCorrect": false, "feedback": "feedback opcional" }] }]`,
      }],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Falha ao gerar questões');

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);

    const created = [];
    for (const q of questions) {
      const question = await this.prisma.question.create({
        data: {
          text: q.text, difficulty: q.difficulty ?? 'MEDIUM', bloomLevel: q.bloomLevel ?? 'REMEMBER',
          explanation: q.explanation, topicId,
          createdById: userId,
          alternatives: { create: q.alternatives?.map((a: { text: string; isCorrect: boolean; feedback?: string }) => ({ text: a.text, isCorrect: a.isCorrect ?? false, feedback: a.feedback })) ?? [] },
        },
        include: { alternatives: true },
      });
      await this.prisma.questionStats.create({ data: { questionId: question.id } });
      created.push(question);
    }
    return created;
  }

  async importQuestions(data: Record<string, unknown>[], userId?: string) {
    let created = 0; let failed = 0; const errors: string[] = []
    for (const q of data) {
      try {
        if (!q.text || !q.topicId) { failed++; errors.push(`Questão sem texto ou topicId`); continue }
        await this.prisma.question.create({
          data: {
            text: q.text as string, type: ((q.type as string) ?? 'MULTIPLA_ESCOLHA') as QuestionType, difficulty: ((q.difficulty as string) ?? 'MEDIUM') as QuestionDifficulty,
            bloomLevel: ((q.bloomLevel as string) ?? 'REMEMBER') as BloomLevel, estimatedTime: (q.estimatedTime as number) ?? 5,
            explanation: q.explanation as string, topicId: q.topicId as string, examId: q.examId as string,
            status: 'PUBLICADA',
            createdById: userId,
            alternatives: q.alternatives ? { create: (q.alternatives as { text: string; isCorrect: boolean; feedback?: string }[]).map((a) => ({ text: a.text, isCorrect: a.isCorrect ?? false, feedback: a.feedback })) } : undefined,
            tags: q.tags ? { create: (q.tags as string[]).map((t) => ({ tag: t })) } : undefined,
          },
        })
        created++
      } catch (e) { failed++; errors.push((e as Error).message) }
    }
    return { created, failed, errors: errors.slice(0, 10) }
  }
}
