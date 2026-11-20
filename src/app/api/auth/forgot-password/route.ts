import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomToken } from '@/lib/auth'

export const runtime = 'nodejs'

const TOKEN_TTL_MS = 1000 * 60 * 60 // 1 hour

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    // Always respond OK to avoid account enumeration
    if (user) {
      await db.verificationToken.deleteMany({
        where: { userId: user.id, type: 'password_reset' },
      })
      const token = randomToken()
      await db.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'password_reset',
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      })
      // In production: send email with /forgot-password?reset=...&email=...
    }
    return NextResponse.json({
      ok: true,
      message: 'If the email exists, a reset link has been sent.',
    })
  } catch (e) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Failed to send reset link.' }, { status: 500 })
  }
}
