import { PrismaClient } from '@prisma/client';

export const prismaDirect = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL, // connexion directe
    },
  },
});
