import { NextResponse } from 'next/server'
import { PRICING_PLANS } from '@/lib/plans'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ plans: PRICING_PLANS })
}
