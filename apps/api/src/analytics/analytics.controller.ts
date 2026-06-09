import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { EventType } from '../generated/prisma/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  trackEvent(@Body() body: { userId: string; type: EventType; metadata?: Record<string, unknown> }) {
    return this.analyticsService.trackEvent(body.userId, body.type, body.metadata);
  }

  @Get('events/:userId')
  getUserEvents(@Param('userId') userId: string) {
    return this.analyticsService.getUserEvents(userId);
  }

  @Get('summary')
  getEventSummary() {
    return this.analyticsService.getEventSummary();
  }

  @Get('professor')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  getProfessorAnalytics() {
    return this.analyticsService.getProfessorAnalytics();
  }

  @Get('professor/courses/:courseId/students')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  getCourseStudents(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseStudents(courseId);
  }
}
