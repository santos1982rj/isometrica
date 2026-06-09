import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('subjects')
  findAllSubjects() {
    return this.knowledgeService.findAllSubjects();
  }

  @Get('subjects/:id')
  findSubjectById(@Param('id') id: string) {
    return this.knowledgeService.findSubjectById(id);
  }

  @Get('topics')
  findAllTopics() {
    return this.knowledgeService.findAllTopics();
  }

  @Get('topics/:topicId/questions')
  findQuestionsByTopic(@Param('topicId') topicId: string) {
    return this.knowledgeService.findQuestionsByTopic(topicId);
  }
}
