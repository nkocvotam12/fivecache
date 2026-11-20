import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body.token || '')
    const password = String(body.password || '')

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 },
      )
    }

    const record = await db.verificationToken.findUnique({
      where: { token },
    })
    if (!record || record.type !== 'password_reset' || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Reset token is invalid or expired.' }, { status: 400 })
    }

    await db.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashPassword(password) },
    })
    await db.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    })
    // Invalidate all sessions for security
    await db.session.deleteMany({ where: { userId: record.userId } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Reset password error:', e)
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 })
  }
}
