import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ContentService } from './content.service';
import { CoursesController } from './courses.controller';
import { ContentController } from './content.controller';

@Module({
  controllers: [CoursesController, ContentController],
  providers: [CoursesService, ContentService],
  exports: [CoursesService, ContentService],
})
export class CoursesModule {}
