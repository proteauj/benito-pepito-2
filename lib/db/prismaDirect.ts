import { PrismaClient } from '@prisma/client';

export const prismaDirect = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // connexion directe
    },
  },
});
