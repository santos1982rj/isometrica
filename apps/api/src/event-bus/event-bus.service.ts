import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import type Redis from 'ioredis';
import { AppEvent, EventType } from './interfaces/event.interface';

type EventHandler = (event: AppEvent) => Promise<void>;

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private handlers = new Map<EventType, EventHandler[]>();
  private readonly fallback = new EventEmitter();
  private readonly CHANNEL = 'isometrica:events';
  private redisEnabled = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured — using in-memory event bus');
      return;
    }

    this.redisEnabled = true;
    const Redis = (await import('ioredis')).default;
    this.publisher = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
    this.subscriber = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });

    try {
      await this.publisher.connect();
      await this.subscriber.connect();
      await this.subscriber.subscribe(this.CHANNEL);
      this.subscriber.on('message', (_channel: string, message: string) => {
        this.handleMessage(message);
      });
      this.logger.log('EventBus connected to Redis');
    } catch (err) {
      this.logger.warn(`Redis unavailable — falling back to in-memory event bus (${(err as Error).message})`);
      await this.publisher.quit().catch(() => {});
      await this.subscriber.quit().catch(() => {});
      this.publisher = null;
      this.subscriber = null;
      this.redisEnabled = false;
    }
  }

  async onModuleDestroy() {
    if (this.publisher) await this.publisher.quit().catch(() => {});
    if (this.subscriber) await this.subscriber.quit().catch(() => {});
  }

  async publish(event: AppEvent): Promise<void> {
    if (this.redisEnabled && this.publisher) {
      const message = JSON.stringify(event);
      await this.publisher.publish(this.CHANNEL, message);
    } else {
      this.fallback.emit(this.CHANNEL, event);
      await Promise.all(
        (this.handlers.get(event.type) ?? []).map((h) => h(event)),
      );
    }
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
