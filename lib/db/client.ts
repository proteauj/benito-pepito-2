// lib/db/client.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Type pour ton client étendu
export type ExtendedPrisma = ReturnType<PrismaClient['$extends']>;

// Prisma singleton pour éviter plusieurs instances
let prisma: ExtendedPrisma;

// On ne veut **pas** que le build essaie de se connecter à la DB
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  // Pendant le build, on renvoie un "stub" vide
  prisma = {} as ExtendedPrisma;
} else {
  // ✅ Runtime (dev ou prod) : initialiser le vrai client avec accelerate
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL non défini !');
  }

  prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }, // s'assure qu'on prend bien l'env Vercel
    },
  }).$extends(withAccelerate());
}

export { prisma };
export type Prisma = typeof prisma;
