// src/lib/db.ts
// Purpose: Prisma client singleton
// Ensures only one database connection instance throughout the app

import { PrismaClient } from '@prisma/client'

// Avoid recreating Prisma client in development hot reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
