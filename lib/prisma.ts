// Forced reload to pick up new Prisma Client
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined
}

// In development, we use a singleton to prevent connection leaks during hot reloads
export const prisma = globalForPrisma.prisma_v3 ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v3 = prisma