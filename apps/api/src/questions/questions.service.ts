import { Injectable } from '@nestjs/common';
import { QuestionCrudService } from './services/question-crud.service';
import { ExamService } from './services/exam.service';
import { QuestionStatsService } from './services/question-stats.service';
import { QuestionGeneratorService } from './services/question-generator.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly crud: QuestionCrudService,
    private readonly examService: ExamService,
    private readonly stats: QuestionStatsService,
    private readonly generator: QuestionGeneratorService,
  ) {}

  list(filters: any) { return this.crud.list(filters); }
  findById(id: string) { return this.crud.findById(id); }
  create(data: any) { return this.crud.create(data); }
  update(id: string, data: any) { return this.crud.update(id, data); }
  remove(id: string) { return this.crud.remove(id); }

  getTags() { return this.examService.getTags(); }
  listExams(filters: any) { return this.examService.listExams(filters); }
  createExam(data: any) { return this.examService.createExam(data); }
  getExamBoards() { return this.examService.getExamBoards(); }
  getExamSimulado(examId: string, limit?: number) { return this.examService.getExamSimulado(examId, limit); }
  getTopicTree() { return this.examService.getTopicTree(); }
  getTopicMastery(userId: string, topicId: string) { return this.examService.getTopicMastery(userId, topicId); }

  getQuestionStats(questionId: string) { return this.stats.getQuestionStats(questionId); }

  generateWithAI(topicId: string, count?: number, difficulty?: string) { return this.generator.generateWithAI(topicId, count, difficulty); }
  importQuestions(data: any[]) { return this.generator.importQuestions(data); }
}
