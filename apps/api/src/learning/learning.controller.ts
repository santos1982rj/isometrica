import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnrollUserDto, MarkProgressDto, SubmitAttemptDto } from './dto';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('enroll')
  enrollUser(@Body() dto: EnrollUserDto) {
    return this.learningService.enrollUser(dto.userId, dto.courseId);
  }

  @Get('enrollments/:userId')
  findEnrollmentsByUser(@Param('userId') userId: string) {
    return this.learningService.findEnrollmentsByUser(userId);
  }

  @Get('enrolled/:userId/:courseId')
  checkEnrollment(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.learningService.checkEnrollment(userId, courseId);
  }

  @Get('next-lessons/:userId')
  getNextLessons(@Param('userId') userId: string) {
    return this.learningService.getNextLessons(userId);
  }

  @Get('week-plan/:userId')
  getWeekPlan(@Param('userId') userId: string) {
    return this.learningService.getWeekPlan(userId);
  }

  @Post('progress')
  markProgress(@Body() dto: MarkProgressDto) {
    return this.learningService.markProgress(dto.userId, dto.lessonId, dto.completed);
  }

  @Get('progress/:userId/:courseId')
  getCourseProgress(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.learningService.getCourseProgress(userId, courseId);
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
  saveNote(@Body() body: { userId: string; lessonId: string; notes: string }) {
    return this.learningService.saveNote(body.userId, body.lessonId, body.notes);
  }

  @Get('notes/:userId/:lessonId')
  getNote(@Param('userId') userId: string, @Param('lessonId') lessonId: string) {
    return this.learningService.getNote(userId, lessonId);
  }

  @Post('attempts')
  submitAttempt(@Body() dto: SubmitAttemptDto) {
    return this.learningService.submitAttempt(dto);
  }

  @Get('model/:userId')
  getStudentModel(@Param('userId') userId: string) {
    return this.learningService.getStudentModel(userId);
  }

  @Get('review/:userId')
  getReview(@Param('userId') userId: string) {
    return this.learningService.getReviewQuestions(userId);
  }

  @Post('review/:questionId/answer')
  answerReview(@Param('questionId') questionId: string, @Body() body: { userId: string; correct: boolean }) {
    return this.learningService.answerReview(body.userId, questionId, body.correct);
  }

  @Get('errors/:userId')
  getErrors(@Param('userId') userId: string) {
    return this.learningService.getUserErrors(userId);
  }

  @Post('errors/:userId/clear')
  clearErrors(@Param('userId') userId: string) {
    return this.learningService.clearUserErrors(userId);
  }

  @Post('diagnostics/:userId')
  createDiagnostic(@Param('userId') userId: string) {
    return this.learningService.createDiagnostic(userId);
  }

  @Get('diagnostics/:userId')
  getDiagnostics(@Param('userId') userId: string) {
    return this.learningService.getDiagnostics(userId);
  }
}
