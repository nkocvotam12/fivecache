import { NextResponse } from 'next/server'
import { MOCK_USER } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      emailVerified: true,
      plan: MOCK_USER.plan,
    },
  })
}
