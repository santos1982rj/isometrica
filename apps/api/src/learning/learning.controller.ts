import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnrollUserDto, MarkProgressDto, SubmitAttemptDto, SaveNoteDto } from './dto';
import { UserRole } from '../generated/prisma/enums';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  private resolveUserId(requestedUserId: string, currentUserId: string, role?: UserRole) {
    return role === UserRole.ADMIN || role === UserRole.PROFESSOR ? requestedUserId : currentUserId;
  }

  @Post('enroll')
  enrollUser(@Body() dto: EnrollUserDto, @CurrentUser('id') userId: string) {
    return this.learningService.enrollUser(userId, dto.courseId);
  }

  @Get('enrollments/:userId')
  findEnrollmentsByUser(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.findEnrollmentsByUser(this.resolveUserId(userId, currentUserId, role));
  }

  @Get('enrolled/:userId/:courseId')
  checkEnrollment(@Param('userId') userId: string, @Param('courseId') courseId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.checkEnrollment(this.resolveUserId(userId, currentUserId, role), courseId);
  }

  @Get('next-lessons/:userId')
  getNextLessons(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getNextLessons(this.resolveUserId(userId, currentUserId, role));
  }

  @Get('week-plan/:userId')
  getWeekPlan(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getWeekPlan(this.resolveUserId(userId, currentUserId, role));
  }

  @Post('progress')
  markProgress(@Body() dto: MarkProgressDto, @CurrentUser('id') userId: string) {
    return this.learningService.markProgress(userId, dto.lessonId, dto.completed);
  }

  @Get('progress/:userId/:courseId')
  getCourseProgress(@Param('userId') userId: string, @Param('courseId') courseId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getCourseProgress(this.resolveUserId(userId, currentUserId, role), courseId);
  }

  @Post('certificate/:courseId')
  generateCertificate(@Param('courseId') courseId: string, @CurrentUser('id') userId: string) {
    return this.learningService.generateCertificate(userId, courseId);
  }

  @Get('certificates')
  getUserCertificates(@CurrentUser('id') userId: string) {
    return this.learningService.getUserCertificates(userId);
  }

  @Post('notes')
  saveNote(@Body() dto: SaveNoteDto, @CurrentUser('id') userId: string) {
    return this.learningService.saveNote(userId, dto.lessonId, dto.notes);
  }

  @Get('notes/:userId/:lessonId')
  getNote(@Param('userId') userId: string, @Param('lessonId') lessonId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getNote(this.resolveUserId(userId, currentUserId, role), lessonId);
  }

  @Post('attempts')
  submitAttempt(@Body() dto: SubmitAttemptDto, @CurrentUser('id') userId: string) {
    return this.learningService.submitAttempt({ ...dto, userId });
  }

  @Get('model/:userId')
  getStudentModel(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getStudentModel(this.resolveUserId(userId, currentUserId, role));
  }

  @Get('review/:userId')
  getReview(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getReviewQuestions(this.resolveUserId(userId, currentUserId, role));
  }

  @Post('review/:questionId/answer')
  answerReview(@Param('questionId') questionId: string, @Body() body: { selectedId: string }, @CurrentUser('id') userId: string) {
    return this.learningService.answerReview(userId, questionId, body.selectedId);
  }

  @Get('errors/:userId')
  getErrors(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getUserErrors(this.resolveUserId(userId, currentUserId, role));
  }

  @Post('errors/:userId/clear')
  clearErrors(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.clearUserErrors(this.resolveUserId(userId, currentUserId, role));
  }

  @Post('diagnostics/:userId')
  createDiagnostic(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.createDiagnostic(this.resolveUserId(userId, currentUserId, role));
  }

  @Get('diagnostics/:userId')
  getDiagnostics(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    return this.learningService.getDiagnostics(this.resolveUserId(userId, currentUserId, role));
  }
}
