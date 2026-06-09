import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes } from '@nestjs/common';
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../generated/prisma/enums';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('modules/:moduleId/lessons')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  createLesson(@Param('moduleId') moduleId: string, @Body() body: { title: string; type: string; order: number; content?: string; videoUrl?: string; free?: boolean }) {
    return this.contentService.createLesson(moduleId, body);
  }

  @Put('lessons/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  updateLesson(@Param('id') id: string, @Body() body: { title?: string; content?: string; videoUrl?: string }) {
    return this.contentService.updateLesson(id, body);
  }

  @Get('lessons/:id')
  @Public()
  findLesson(@Param('id') id: string) {
    return this.contentService.findLesson(id);
  }

  @Get('lessons/:id/questions')
  @Public()
  findLessonQuestions(@Param('id') id: string) {
    return this.contentService.findLessonQuestions(id);
  }

  @Post('questions')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  createQuestion(@Body() body: {
    text: string
    topicId: string
    difficulty: string
    bloomLevel: string
    explanation?: string
    alternatives: { text: string; isCorrect: boolean }[]
  }) {
    return this.contentService.createQuestion(body);
  }

  // Modules
  @Post('courses/:courseId/modules')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  createModule(@Param('courseId') courseId: string, @Body() body: { name: string; order: number }) {
    return this.contentService.createModule(courseId, body);
  }

  @Put('modules/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  updateModule(@Param('id') id: string, @Body() body: { name?: string; order?: number }) {
    return this.contentService.updateModule(id, body);
  }

  @Delete('modules/:id')
  @Roles(UserRole.ADMIN)
  removeModule(@Param('id') id: string) {
    return this.contentService.removeModule(id);
  }

  @Delete('lessons/:id')
  @Roles(UserRole.ADMIN)
  removeLesson(@Param('id') id: string) {
    return this.contentService.removeLesson(id);
  }
}
