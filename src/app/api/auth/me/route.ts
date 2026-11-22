import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, parseSessionCookie } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = parseSessionCookie(req)
  const session = await getSession(token)
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: !!session.user.emailVerified,
      plan: session.user.plan,
    },
  })
}
