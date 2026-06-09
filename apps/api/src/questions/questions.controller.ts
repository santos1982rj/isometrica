import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @Public()
  list(@Query() filters: any) {
    return this.questionsService.list(filters);
  }

  @Get('tree')
  @Public()
  getTopicTree() {
    return this.questionsService.getTopicTree();
  }

  @Get('tags')
  @Public()
  getTags() {
    return this.questionsService.getTags();
  }

  @Get('exams')
  @Public()
  listExams(@Query() filters: any) {
    return this.questionsService.listExams(filters);
  }

  @Get('exams/boards')
  @Public()
  getExamBoards() {
    return this.questionsService.getExamBoards();
  }

  @Get('stats/:id')
  @Public()
  getQuestionStats(@Param('id') id: string) {
    return this.questionsService.getQuestionStats(id);
  }

  @Get('mastery/:topicId')
  getTopicMastery(@Param('topicId') topicId: string, @CurrentUser('id') userId: string) {
    return this.questionsService.getTopicMastery(userId, topicId);
  }

  @Get('simulado/:examId')
  @Public()
  getExamSimulado(@Param('examId') examId: string, @Query('limit') limit?: string) {
    return this.questionsService.getExamSimulado(examId, limit ? Number(limit) : 10);
  }

  @Get(':id')
  @Public()
  findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Post()
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.questionsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Post('generate/:topicId')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  generateWithAI(@Param('topicId') topicId: string, @Body() body: { count?: number; difficulty?: string }) {
    return this.questionsService.generateWithAI(topicId, body.count ?? 3, body.difficulty);
  }

  @Post('exams')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  createExam(@Body() body: any) {
    return this.questionsService.createExam(body);
  }

  @Post('import')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  importQuestions(@Body() body: { questions: any[] }) {
    return this.questionsService.importQuestions(body.questions);
  }
}
