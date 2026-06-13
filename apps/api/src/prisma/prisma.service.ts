import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

function buildOptions(connectionString: string) {
  if (connectionString.includes('neon.tech')) {
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const { neonConfig } = require('@neondatabase/serverless');
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
    return { adapter: new PrismaNeon({ connectionString }) };
  }
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pg = require('pg');
  const pool = new pg.Pool({ connectionString });
  return { adapter: new PrismaPg(pool) };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL')!;
    super(buildOptions(connectionString) as Prisma.PrismaClientOptions);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
