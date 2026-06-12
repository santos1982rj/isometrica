import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentModelService } from './student-model.service';
import { EnrollmentService } from './services/enrollment.service';
import { ProgressService } from './services/progress.service';
import { CertificateService } from './services/certificate.service';
import { AttemptService } from './services/attempt.service';

@Injectable()
export class LearningService {
  constructor(
    public readonly enrollment: EnrollmentService,
    public readonly progress: ProgressService,
    public readonly certificate: CertificateService,
    public readonly attempt: AttemptService,
    private readonly prisma: PrismaService,
    private readonly studentModel: StudentModelService,
  ) {}

  enrollUser(userId: string, courseId: string) {
    return this.enrollment.enrollUser(userId, courseId);
  }

  checkEnrollment(userId: string, courseId: string) {
    return this.enrollment.checkEnrollment(userId, courseId);
  }

  findEnrollmentsByUser(userId: string) {
    return this.enrollment.findEnrollmentsByUser(userId);
  }

  markProgress(userId: string, lessonId: string, completed: boolean) {
    return this.progress.markProgress(userId, lessonId, completed);
  }

  getCourseProgress(userId: string, courseId: string) {
    return this.progress.getCourseProgress(userId, courseId);
  }

  generateCertificate(userId: string, courseId: string) {
    return this.certificate.generateCertificate(userId, courseId);
  }

  getUserCertificates(userId: string) {
    return this.certificate.getUserCertificates(userId);
  }

  getNextLessons(userId: string) {
    return this.progress.getNextLessons(userId);
  }

  getWeekPlan(userId: string) {
    return this.progress.getWeekPlan(userId);
  }

  saveNote(userId: string, lessonId: string, notes: string) {
    return this.progress.saveNote(userId, lessonId, notes);
  }

  getNote(userId: string, lessonId: string) {
    return this.progress.getNote(userId, lessonId);
  }

  submitAttempt(data: {
    userId: string;
    questionId: string;
    selectedId: string;
    timeSpent?: number;
    hintUsed?: boolean;
  }) {
    return this.attempt.submitAttempt(data);
  }

  getReviewQuestions(userId: string) {
    return this.attempt.getReviewQuestions(userId);
  }

  answerReview(userId: string, questionId: string, selectedId: string) {
    return this.attempt.answerReview(userId, questionId, selectedId);
  }

  getUserErrors(userId: string) {
    return this.attempt.getUserErrors(userId);
  }

  clearUserErrors(userId: string) {
    return this.attempt.clearUserErrors(userId);
  }

  getStudentModel(userId: string) {
    return this.studentModel.getStudentModel(userId);
  }

  getDiagnostics(userId: string) {
    return this.prisma.diagnostic.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDiagnostic(userId: string) {
    return this.studentModel.createDiagnostic(userId);
  }
}
