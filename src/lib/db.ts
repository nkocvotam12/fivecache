import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

function getPrismaInstance(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  try {
    const client = new PrismaClient({
      log: ['query'],
    })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch (err) {
    console.warn('PrismaClient is not ready, falling back to mock mode:', err)
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
          return () => Promise.reject(new Error('@prisma/client did not initialize yet'))
        },
      })
    }
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
