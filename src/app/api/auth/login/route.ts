import { NextResponse } from 'next/server'
import { MOCK_USER } from '@/lib/api'
import { SESSION_COOKIE } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST() {
  const res = NextResponse.json({
    ok: true,
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      emailVerified: true,
      plan: MOCK_USER.plan,
    },
  })
  res.cookies.set(SESSION_COOKIE, 'demo_session_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
