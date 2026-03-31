import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "postgresql://fleetmada:***@localhost:5434/fleetmada_db?schema=public",
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma