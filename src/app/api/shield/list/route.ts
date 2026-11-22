import { NextRequest, NextResponse } from 'next/server'
import { db, isDbConfigured } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

const DEMO_SHIELDS = [
  {
    id: 'sh_demo_1',
    code: 'sharkcity',
    name: 'SharkCITY Anti-Dump',
    domain: 'sharkcity.fivecache.shield',
    cacheUrl: 'https://sharkcity.fivecache.shield/files',
    originHost: '103.145.2.10',
    originPort: 30120,
    protocol: 'http',
    status: 'active' as const,
    pricePerMonth: 299000,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    totalRequests: 482900,
    blockedRequests: 1420,
    bandwidthServed: 54975581388,
    uniquePlayers: 342,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(req: NextRequest) {
  const { user } = await requireUser(req)

  if (!isDbConfigured()) {
    return NextResponse.json({
      balance: 500000,
      shields: DEMO_SHIELDS,
      stats: {
        totalShields: 1,
        activeShields: 1,
        totalMonthlyCost: 299000,
        totalRequests: 482900,
        totalBlocked: 1420,
      },
    })
  }

  try {
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

    const finalShields = shields.length > 0 ? shields : DEMO_SHIELDS
    const totalMonthlyCost = finalShields
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.pricePerMonth, 0)

    return NextResponse.json({
      balance: user.balanceVnd ?? 500000,
      shields: finalShields,
      stats: {
        totalShields: finalShields.length,
        activeShields: finalShields.filter((s) => s.status === 'active').length,
        totalMonthlyCost,
        totalRequests: finalShields.reduce((sum, s) => sum + s.totalRequests, 0),
        totalBlocked: finalShields.reduce((sum, s) => sum + s.blockedRequests, 0),
      },
    })
  } catch {
    return NextResponse.json({
      balance: 500000,
      shields: DEMO_SHIELDS,
      stats: {
        totalShields: 1,
        activeShields: 1,
        totalMonthlyCost: 299000,
        totalRequests: 482900,
        totalBlocked: 1420,
      },
    })
  }
}
