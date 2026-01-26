import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma = new PrismaClient().$extends(withAccelerate())

// Eviter multiples instances en dev (Next.js hot reload)
if (process.env.NODE_ENV !== 'production') {
  ;(globalThis as any).prisma = (globalThis as any).prisma || prisma
  prisma = (globalThis as any).prisma
}

export { prisma }
export type Prisma = typeof prisma