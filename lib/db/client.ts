// lib/db/client.ts 
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is missing at runtime');
} else {
  console.log('DATABASE_URL at runtime:', process.env.DATABASE_URL);
}
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // 🔒 force explicite
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
