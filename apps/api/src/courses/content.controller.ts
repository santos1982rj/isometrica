import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes } from '@nestjs/common';
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('modules/:moduleId/lessons')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  createLesson(@Param('moduleId') moduleId: string, @Body() body: { title: string; type: string; order: number; content?: string; contentUrl?: string; free?: boolean }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.createLesson(moduleId, body, userId, role);
  }

  @Put('lessons/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  updateLesson(@Param('id') id: string, @Body() body: { title?: string; content?: string; contentUrl?: string }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.updateLesson(id, body, userId, role);
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
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.contentService.createQuestion(dto);
  }

  // Modules
  @Post('courses/:courseId/modules')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  createModule(@Param('courseId') courseId: string, @Body() body: { name: string; order: number }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.createModule(courseId, body, userId, role);
  }

  @Put('modules/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  updateModule(@Param('id') id: string, @Body() body: { name?: string; order?: number }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.updateModule(id, body, userId, role);
  }

  @Delete('modules/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  removeModule(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.removeModule(id, userId, role);
  }

  @Delete('lessons/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  removeLesson(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.removeLesson(id, userId, role);
  }

  // Lesson Materials
  @Post('lessons/:lessonId/materials')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  createLessonMaterial(@Param('lessonId') lessonId: string, @Body() body: { name: string; url: string; type?: string; order?: number }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.createLessonMaterial(lessonId, body, userId, role);
  }

  @Put('materials/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  updateLessonMaterial(@Param('id') id: string, @Body() body: { name?: string; url?: string; type?: string; order?: number }, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.updateLessonMaterial(id, body, userId, role);
  }

  @Delete('materials/:id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  removeLessonMaterial(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.contentService.removeLessonMaterial(id, userId, role);
  }
}
