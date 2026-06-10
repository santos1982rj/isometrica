import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsEventHandler } from './analytics.handler';
import { GamificationEventHandler } from './gamification.handler';
import { AiEventHandler } from './ai.handler';
import { GamificationModule } from '../../gamification/gamification.module';
import { AnalyticsModule } from '../../analytics/analytics.module';

@Module({
  imports: [forwardRef(() => GamificationModule), AnalyticsModule],
  providers: [AnalyticsEventHandler, GamificationEventHandler, AiEventHandler],
})
export class HandlersModule {}
