import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  const record = await db.verificationToken.findUnique({ where: { token } })
  if (!record || record.type !== 'email_verification' || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Verification token is invalid or expired.' }, { status: 400 })
  }
  await db.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  })
  await db.verificationToken.update({
    where: { id: record.id },
    data: { used: true },
  })
  return NextResponse.json({ ok: true })
}
