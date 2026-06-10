import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { StudentModelService } from './student-model.service';
import { StudentModelEventHandler } from './student-model.handler';
import { EnrollmentService } from './services/enrollment.service';
import { ProgressService } from './services/progress.service';
import { CertificateService } from './services/certificate.service';
import { AttemptService } from './services/attempt.service';

@Module({
  controllers: [LearningController],
  providers: [
    LearningService,
    StudentModelService,
    StudentModelEventHandler,
    EnrollmentService,
    ProgressService,
    CertificateService,
    AttemptService,
  ],
  exports: [LearningService, StudentModelService],
})
export class LearningModule {}
