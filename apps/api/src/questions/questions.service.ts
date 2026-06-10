import { Injectable } from '@nestjs/common';
import { QuestionCrudService } from './services/question-crud.service';
import { ExamService } from './services/exam.service';
import { QuestionStatsService } from './services/question-stats.service';
import { QuestionGeneratorService } from './services/question-generator.service';
import { QuestionFiltersDto, CreateQuestionDto, UpdateQuestionDto, CreateExamDto } from './dto';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly crud: QuestionCrudService,
    private readonly examService: ExamService,
    private readonly stats: QuestionStatsService,
    private readonly generator: QuestionGeneratorService,
  ) {}

  list(filters: QuestionFiltersDto) { return this.crud.list(filters as any); }
  findById(id: string) { return this.crud.findById(id); }
  create(data: CreateQuestionDto) { return this.crud.create(data as any); }
  update(id: string, data: UpdateQuestionDto) { return this.crud.update(id, data as any); }
  remove(id: string) { return this.crud.remove(id); }

  getTags() { return this.examService.getTags(); }
  listExams(filters: QuestionFiltersDto) { return this.examService.listExams(filters as any); }
  createExam(data: CreateExamDto) { return this.examService.createExam(data as any); }
  getExamBoards() { return this.examService.getExamBoards(); }
  getExamSimulado(examId: string, limit?: number) { return this.examService.getExamSimulado(examId, limit); }
  getTopicTree() { return this.examService.getTopicTree(); }
  getTopicMastery(userId: string, topicId: string) { return this.examService.getTopicMastery(userId, topicId); }

  getQuestionStats(questionId: string) { return this.stats.getQuestionStats(questionId); }

  generateWithAI(topicId: string, count?: number, difficulty?: string) { return this.generator.generateWithAI(topicId, count, difficulty); }
  importQuestions(data: Record<string, unknown>[]) { return this.generator.importQuestions(data); }
}
