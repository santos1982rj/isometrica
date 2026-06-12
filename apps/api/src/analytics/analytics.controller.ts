import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, EventType } from '../generated/prisma/enums';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @Roles(UserRole.ADMIN)
  trackEvent(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: TrackEventDto) {
    return this.analyticsService.trackEvent(dto.userId, dto.type as EventType, dto.metadata);
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
