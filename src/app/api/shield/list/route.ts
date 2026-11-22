import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const shields = await db.shieldServer.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      name: true,
      domain: true,
      cacheUrl: true,
      originHost: true,
      originPort: true,
      protocol: true,
      status: true,
      pricePerMonth: true,
      expiresAt: true,
      autoRenew: true,
      totalRequests: true,
      blockedRequests: true,
      bandwidthServed: true,
      uniquePlayers: true,
      createdAt: true,
    },
  })

  const totalMonthlyCost = shields
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.pricePerMonth, 0)

  return NextResponse.json({
    balance: user.balanceVnd,
    shields,
    stats: {
      totalShields: shields.length,
      activeShields: shields.filter((s) => s.status === 'active').length,
      totalMonthlyCost,
      totalRequests: shields.reduce((sum, s) => sum + s.totalRequests, 0),
      totalBlocked: shields.reduce((sum, s) => sum + s.blockedRequests, 0),
    },
  })
}
