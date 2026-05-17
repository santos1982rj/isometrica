import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function criarPrisma(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Railway define DATABASE_URL automaticamente para o banco PostgreSQL
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    return new PrismaClient({ adapter });
  }

  // Desenvolvimento local: SQLite
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  });
  return new PrismaClient({ adapter });
}

export const prisma = criarPrisma();