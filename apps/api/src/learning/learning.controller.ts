import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LearningService } from './learning.service';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('enroll')
  enrollUser(@Body() body: { userId: string; courseId: string }) {
    return this.learningService.enrollUser(body.userId, body.courseId);
  }

  @Get('enrollments/:userId')
  findEnrollmentsByUser(@Param('userId') userId: string) {
    return this.learningService.findEnrollmentsByUser(userId);
  }

  @Post('attempts')
  submitAttempt(@Body() body: {
    userId: string;
    questionId: string;
    selectedId: string;
    correct: boolean;
    timeSpent?: number;
    hintUsed?: boolean;
  }) {
    return this.learningService.submitAttempt(body);
  }

  @Get('model/:userId')
  getStudentModel(@Param('userId') userId: string) {
    return this.learningService.getStudentModel(userId);
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
