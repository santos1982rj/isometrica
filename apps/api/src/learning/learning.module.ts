import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { StudentModelService } from './student-model.service';
import { StudentModelEventHandler } from './student-model.handler';

@Module({
  controllers: [LearningController],
  providers: [LearningService, StudentModelService, StudentModelEventHandler],
  exports: [LearningService, StudentModelService],
})
export class LearningModule {}
