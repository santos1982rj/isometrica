import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsEventHandler } from './analytics.handler';
import { GamificationEventHandler } from './gamification.handler';
import { AiEventHandler } from './ai.handler';
import { GamificationModule } from '../../gamification/gamification.module';

@Module({
  imports: [forwardRef(() => GamificationModule)],
  providers: [AnalyticsEventHandler, GamificationEventHandler, AiEventHandler],
})
export class HandlersModule {}
