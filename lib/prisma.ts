// Forced reload to pick up new Prisma Client
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development, we use a fresh client if needed to pick up schema changes
export const prisma = process.env.NODE_ENV === 'production'
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma