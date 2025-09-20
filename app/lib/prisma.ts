import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with explicit database URL
const path = require('path');
const dbPath = path.join(process.cwd(), 'backend', 'dev.db');

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;