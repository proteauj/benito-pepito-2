// lib/db/client.ts
import { PrismaClient } from '@prisma/client'; 

declare global {
  // ⚠️ Permet à TypeScript de savoir que global.prisma existe
  var prisma: PrismaClient | undefined;
}

// Prisma singleton pour éviter plusieurs instances en dev
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : [],
  });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;