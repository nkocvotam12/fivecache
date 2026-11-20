import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

// GET /api/shield/[id]/stats
// Aggregated stats for the shield dashboard widget
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  // Aggregate last 24h logs
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentLogs = await db.shieldAccessLog.groupBy({
    by: ['status'],
    where: { shieldId: shield.id, timestamp: { gte: since } },
    _count: { _all: true },
  })

  const topBlockedReasons = await db.shieldAccessLog.groupBy({
    by: ['reason'],
    where: { shieldId: shield.id, status: 'blocked', timestamp: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { _all: 'desc' } },
    take: 5,
  })

  return NextResponse.json({
    shield: {
      id: shield.id,
      code: shield.code,
      name: shield.name,
      status: shield.status,
      expiresAt: shield.expiresAt,
    },
    totals: {
      requests: shield.totalRequests,
      blocked: shield.blockedRequests,
      allowed: shield.totalRequests - shield.blockedRequests,
      bandwidthServed: shield.bandwidthServed,
      bandwidthFormatted: formatBytes(shield.bandwidthServed),
      uniquePlayers: shield.uniquePlayers,
      blockRate:
        shield.totalRequests > 0
          ? Math.round((shield.blockedRequests / shield.totalRequests) * 1000) / 10
          : 0,
    },
    last24h: {
      allowed: recentLogs.find((l) => l.status === 'allowed')?._count._all ?? 0,
      blocked: recentLogs.find((l) => l.status === 'blocked')?._count._all ?? 0,
      topBlockedReasons: topBlockedReasons.map((r) => ({
        reason: r.reason,
        count: r._count._all,
      })),
    },
  })
}
