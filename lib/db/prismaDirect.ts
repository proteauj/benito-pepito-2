import { PrismaClient } from '@prisma/client';

export const prismaDirect = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DB_DATABASE_URL, // connexion directe
    },
  },
});
