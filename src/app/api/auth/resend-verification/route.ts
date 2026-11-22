import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomToken } from '@/lib/auth'

export const runtime = 'nodejs'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours

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
        where: { userId: user.id, type: 'email_verification' },
      })
      const token = randomToken()
      await db.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'email_verification',
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      })
      // In production: send email with /verify-email?token=...&email=...
      // For demo: auto-verify
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Resend verification error:', e)
    return NextResponse.json(
      { error: 'Failed to resend verification email.' },
      { status: 500 },
    )
  }
}
