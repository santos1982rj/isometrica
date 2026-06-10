import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionCrudService } from './services/question-crud.service';
import { ExamService } from './services/exam.service';
import { QuestionStatsService } from './services/question-stats.service';
import { QuestionGeneratorService } from './services/question-generator.service';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionCrudService, ExamService, QuestionStatsService, QuestionGeneratorService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
