// prisma.config.ts (à la racine de my-app)
const config = {
  datasources: {
    db: {
      // Prisma Accelerate si défini
      ...(process.env.PRISMA_ACCELERATE_URL
        ? { accelerateUrl: process.env.PRISMA_ACCELERATE_URL }
        : { url: process.env.DB_DATABASE_URL }), // fallback DB classique
    },
  },
}

export default config