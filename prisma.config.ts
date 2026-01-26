// prisma.config.ts
const config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}