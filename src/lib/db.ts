import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL || ''
  return url.startsWith('postgresql://') || url.startsWith('postgres://')
}

function getPrismaInstance(): PrismaClient | null {
  // If DATABASE_URL is not a valid Postgres connection string (e.g. still local file:./dev.db),
  // don't even instantiate Prisma to avoid validation errors
  if (!isDbConfigured()) {
    return null
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma

  try {
    const client = new PrismaClient({
      log: ['query'],
    })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch {
    return null
  }
}

// Safe lazy proxy so accessing db doesn't crash at module import time
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaInstance()
    if (!client) {
      return new Proxy({}, {
        get() {
          return () => Promise.reject(new Error('Database is not configured for PostgreSQL'))
        },
      })
    }
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
