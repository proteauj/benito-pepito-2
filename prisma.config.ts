// prisma.config.ts
const config = {
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL,
    },
  },
}