import { Module } from '@nestjs/common';
import { AnalyticsEventHandler } from './analytics.handler';
import { GamificationEventHandler } from './gamification.handler';
import { AiEventHandler } from './ai.handler';

@Module({
  providers: [AnalyticsEventHandler, GamificationEventHandler, AiEventHandler],
})
export class HandlersModule {}
