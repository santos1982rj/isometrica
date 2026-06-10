import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { AppEvent, EventType } from '../interfaces/event.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiEventHandler {
  private readonly logger = new Logger(AiEventHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {
    this.eventBus.registerHandler(EventType.QUESTION_INCORRECT, (event) => this.onIncorrectAnswer(event));
    this.eventBus.registerHandler(EventType.ENROLLMENT_CREATED, (event) => this.onEnrollment(event));
  }

  private async onIncorrectAnswer(event: AppEvent): Promise<void> {
    try {
      await this.prisma.recommendation.create({
        data: {
          userId: event.userId,
          title: 'Rever tópico com dificuldade',
          description: 'Você errou uma questão. Sugerimos revisar o conteúdo antes de tentar novamente.',
          type: 'revision',
        },
      });
      this.logger.log(`Recommendation created for user ${event.userId} (incorrect answer)`);
    } catch (err) {
      this.logger.error(`Failed to create recommendation for user ${event.userId}`, err);
    }
  }

  private async onEnrollment(event: AppEvent): Promise<void> {
    try {
      await this.prisma.recommendation.create({
        data: {
          userId: event.userId,
          title: 'Comece pelos primeiros módulos',
          description: 'Você se matriculou em um novo curso. Explore o conteúdo sequencialmente para melhor aproveitamento.',
          type: 'onboarding',
        },
      });
      this.logger.log(`Recommendation created for user ${event.userId} (new enrollment)`);
    } catch (err) {
      this.logger.error(`Failed to create recommendation for user ${event.userId}`, err);
    }
  }
}
