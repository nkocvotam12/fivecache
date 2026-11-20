import { db } from './db'
import crypto from 'crypto'

export const SESSION_COOKIE = 'fivecache_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

// PBKDF2 hashing using built-in node crypto - no external deps required
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const iterations = 120000
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    .toString('hex')
  return `pbkdf2$${iterations}$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, iterStr, salt, hash] = stored.split('$')
    if (algo !== 'pbkdf2') return false
    const iterations = parseInt(iterStr, 10)
    const verify = crypto
      .pbkdf2Sync(password, salt, iterations, 64, 'sha512')
      .toString('hex')
    // Timing-safe compare
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verify))
  } catch {
    return false
  }
}

export function randomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateServerId(): string {
  // 8-char alphanumeric, lowercase
  return crypto.randomBytes(4).toString('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await db.session.create({
    data: { userId, token, expiresAt },
  })
  return token
}

export async function getSession(token: string | undefined) {
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }
  return session
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } })
}

export function parseSessionCookie(req: Request): string | undefined {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match?.[1]
}
