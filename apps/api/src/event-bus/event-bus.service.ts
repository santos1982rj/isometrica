import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppEvent, EventType } from './interfaces/event.interface';

type EventHandler = (event: AppEvent) => Promise<void>;

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private publisher!: Redis;
  private subscriber!: Redis;
  private handlers = new Map<EventType, EventHandler[]>();
  private readonly CHANNEL = 'isometrica:events';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.subscribe(this.CHANNEL);
    this.subscriber.on('message', (_channel: string, message: string) => {
      this.handleMessage(message);
    });

    this.logger.log('EventBus connected to Redis');
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async publish(event: AppEvent): Promise<void> {
    const message = JSON.stringify(event);
    await this.publisher.publish(this.CHANNEL, message);
    this.logger.debug(`Event published: ${event.type}`);
  }

  registerHandler(eventType: EventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const event: AppEvent = JSON.parse(message);
      const handlers = this.handlers.get(event.type);

      if (handlers) {
        await Promise.all(handlers.map((handler) => handler(event)));
      }
    } catch (error) {
      this.logger.error(`Failed to handle event: ${(error as Error).message}`);
    }
  }
}
