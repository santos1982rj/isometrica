import { Controller, Get, Post, Put, Delete, Param, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  create(@Body() body: { name: string; description: string; category?: string; imageUrl?: string; color?: string; estimatedHours?: number; level?: string; premium?: boolean; certificateEnabled?: boolean; price?: number }) {
    return this.coursesService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string; imageUrl?: string; category?: string }) {
    return this.coursesService.update(id, body);
  }

  @Get('search/:q')
  async search(@Param('q') q: string) {
    const [courses, modules, lessons] = await Promise.all([
      this.coursesService.searchCourses(q),
      this.coursesService.searchModules(q),
      this.coursesService.searchLessons(q),
    ]);
    return { results: { courses, modules, lessons }, total: courses.length + modules.length + lessons.length };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/purchase')
  purchase(@Param('id') id: string, @CurrentUser('id') userId: string) {
    if (!userId) throw new UnauthorizedException();
    return this.coursesService.purchaseCourse(userId, id);
  }

  @Get(':id/access')
  checkAccess(@Param('id') id: string, @CurrentUser('id') userId: string) {
    if (!userId) return { hasAccess: false };
    return this.coursesService.checkAccess(userId, id);
  }
}
