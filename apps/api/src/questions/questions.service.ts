import { Injectable } from '@nestjs/common';
import { QuestionCrudService } from './services/question-crud.service';
import { ExamService } from './services/exam.service';
import { QuestionStatsService } from './services/question-stats.service';
import { QuestionGeneratorService } from './services/question-generator.service';
import { QuestionFiltersDto, CreateQuestionDto, UpdateQuestionDto, CreateExamDto, UpdateExamDto, SubmitSimuladoDto } from './dto';
import { UserRole } from '../generated/prisma/enums';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly crud: QuestionCrudService,
    private readonly examService: ExamService,
    private readonly stats: QuestionStatsService,
    private readonly generator: QuestionGeneratorService,
  ) {}

  list(filters: QuestionFiltersDto) { return this.crud.list(filters); }
  findById(id: string) { return this.crud.findById(id); }
  create(data: CreateQuestionDto, userId?: string) { return this.crud.create(data, userId); }
  update(id: string, data: UpdateQuestionDto, userId: string, role: UserRole) { return this.crud.update(id, data as unknown as Record<string, unknown>, userId, role); }
  remove(id: string, userId: string, role: UserRole) { return this.crud.remove(id, userId, role); }

  getTags() { return this.examService.getTags(); }
  listExams(filters: QuestionFiltersDto) { return this.examService.listExams(filters); }
  createExam(data: CreateExamDto, userId?: string) { return this.examService.createExam(data, userId); }
  getExamBoards() { return this.examService.getExamBoards(); }
  getExamSimulado(examId: string, limit?: number) { return this.examService.getExamSimulado(examId, limit); }
  getTopicTree() { return this.examService.getTopicTree(); }
  getTopicMastery(userId: string, topicId: string) { return this.examService.getTopicMastery(userId, topicId); }

  getExamById(id: string) { return this.examService.getExamById(id); }
  updateExam(id: string, data: UpdateExamDto, userId: string, role: UserRole) { return this.examService.updateExam(id, data, userId, role); }
  deleteExam(id: string, userId: string, role: UserRole) { return this.examService.deleteExam(id, userId, role); }

  startSimulado(userId: string, examId: string) { return this.examService.startSimulado(userId, examId); }
  submitSimulado(sessionId: string, userId: string, dto: SubmitSimuladoDto) {
    return this.examService.submitSimulado(sessionId, userId, dto.answers);
  }
  getSimuladoResult(sessionId: string) { return this.examService.getSimuladoResult(sessionId); }

  getQuestionStats(questionId: string) { return this.stats.getQuestionStats(questionId); }

  generateWithAI(topicId: string, count?: number, difficulty?: string, userId?: string) { return this.generator.generateWithAI(topicId, count, difficulty, userId); }
  importQuestions(data: Record<string, unknown>[], userId?: string) { return this.generator.importQuestions(data, userId); }
}
