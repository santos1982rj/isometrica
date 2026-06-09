import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { LearningModule } from './learning/learning.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GamificationModule } from './gamification/gamification.module';
import { FinancialModule } from './financial/financial.module';
import { QuestionsModule } from './questions/questions.module';
import { ProfileModule } from './profile/profile.module';
import { EmailModule } from './email/email.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    CommonModule,
    PrismaModule,
    EventBusModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    KnowledgeModule,
    LearningModule,
    AiModule,
    AnalyticsModule,
    GamificationModule,
    FinancialModule,
    ProfileModule,
    QuestionsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
