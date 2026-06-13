import { Controller, Get, Post, Put, Delete, Param, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Public()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @Public()
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  create(@Body() dto: CreateCourseDto, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.coursesService.create(dto, role === UserRole.PROFESSOR ? userId : undefined);
  }

  @Put(':id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.coursesService.update(dto, id, userId, role);
  }

  @Get('search/:q')
  @Public()
  async search(@Param('q') q: string) {
    const [courses, modules, lessons] = await Promise.all([
      this.coursesService.searchCourses(q),
      this.coursesService.searchModules(q),
      this.coursesService.searchLessons(q),
    ]);
    return { results: { courses, modules, lessons }, total: courses.length + modules.length + lessons.length };
  }

  @Delete(':id')
  @Roles(UserRole.PROFESSOR, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('papel') role: UserRole) {
    return this.coursesService.remove(id, userId, role);
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
