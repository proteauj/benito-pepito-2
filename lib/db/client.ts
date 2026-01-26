// lib/db/client.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

type ExtendedPrisma = PrismaClient & ReturnType<typeof withAccelerate>;

let prisma: ExtendedPrisma;

if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  prisma = {} as any; // build-time placeholder
} else {
  prisma = new PrismaClient().$extends(withAccelerate()) as unknown as ExtendedPrisma;
}

export { prisma };
export type Prisma = typeof prisma;