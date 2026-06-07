import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  findAllSubjects() {
    return this.prisma.subject.findMany({ include: { topics: true } });
  }

  findSubjectById(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: { topics: { include: { questions: { include: { alternatives: true } } } } },
    });
  }

  findQuestionsByTopic(topicId: string) {
    return this.prisma.question.findMany({
      where: { topicId },
      include: { alternatives: true },
    });
  }
}
