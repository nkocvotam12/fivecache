import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const servers = await db.cacheServer.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      topCountries: { orderBy: { requests: 'desc' }, take: 6 },
      topFiles: { orderBy: { requests: 'desc' }, take: 6 },
    },
  })

  if (servers.length === 0) {
    return NextResponse.json({
      servers: [],
      selected: null,
      stats: null,
    })
  }

  const selectedId = req.nextUrl.searchParams.get('serverId')
  const selected = servers.find((s) => s.id === selectedId) || servers[0]
  const monthlyStats = await db.monthlyStat.findMany({
    where: { serverId: selected.id },
    orderBy: { month: 'asc' },
    take: 12,
  })

  const totalStatus =
    selected.status2xx + selected.status3xx + selected.status4xx + selected.status5xx || 1

  const stats = {
    serverId: selected.serverId,
    name: selected.name,
    domain: selected.domain,
    cacheUrl: selected.cacheUrl,
    blocked: selected.blocked,
    resetDate: selected.resetDate,
    plan: selected.plan,
    totals: {
      requests: selected.totalRequests,
      bandwidthUsed: selected.bandwidthUsed,
      bandwidthUsedFormatted: formatBytes(selected.bandwidthUsed),
      storageUsed: selected.storageUsed,
      storageUsedFormatted: formatBytes(selected.storageUsed),
      cacheHitRate: selected.cacheHitRate,
      filesCached: selected.filesCached,
    },
    statusCodes: {
      '2xx': selected.status2xx,
      '3xx': selected.status3xx,
      '4xx': selected.status4xx,
      '5xx': selected.status5xx,
      total: totalStatus,
      percentages: {
        '2xx': Math.round((selected.status2xx / totalStatus) * 1000) / 10,
        '3xx': Math.round((selected.status3xx / totalStatus) * 1000) / 10,
        '4xx': Math.round((selected.status4xx / totalStatus) * 1000) / 10,
        '5xx': Math.round((selected.status5xx / totalStatus) * 1000) / 10,
      },
    },
    topCountries: selected.topCountries,
    topFiles: selected.topFiles,
    monthlyStats: monthlyStats.map((m) => ({
      month: m.month,
      requests: m.requests,
      bandwidth: m.bandwidth,
      bandwidthFormatted: formatBytes(m.bandwidth),
      hitRate: m.hitRate,
    })),
  }

  return NextResponse.json({
    servers: servers.map((s) => ({
      id: s.id,
      serverId: s.serverId,
      name: s.name,
      domain: s.domain,
      blocked: s.blocked,
      plan: s.plan,
    })),
    selected: { id: selected.id, serverId: selected.serverId, name: selected.name },
    stats,
  })
}
