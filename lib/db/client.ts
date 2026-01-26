// lib/db/client.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Évite les doubles instances en dev (Next.js app/)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Création du client
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // optionnel, utile pour debug
  });

// Pour dev uniquement
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;