import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('subjects')
  @Public()
  findAllSubjects() {
    return this.knowledgeService.findAllSubjects();
  }

  @Get('subjects/:id')
  @Public()
  findSubjectById(@Param('id') id: string) {
    return this.knowledgeService.findSubjectById(id);
  }

  @Get('topics')
  @Public()
  findAllTopics() {
    return this.knowledgeService.findAllTopics();
  }

  @Get('topics/:topicId/questions')
  @Public()
  findQuestionsByTopic(@Param('topicId') topicId: string) {
    return this.knowledgeService.findQuestionsByTopic(topicId);
  }
}
