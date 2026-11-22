import { NextRequest, NextResponse } from 'next/server'
import { db, isDbConfigured } from '@/lib/db'
import { requireUser, formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

const DEMO_STATS = {
  servers: [
    {
      id: 'srv_demo_1',
      serverId: 'sharkcity',
      name: 'SharkCITY FiveM RP',
      domain: 'sharkcity.fivecachesite.vercel.app',
      blocked: false,
      plan: 'pro_plus',
    },
    {
      id: 'srv_demo_2',
      serverId: 'midnight',
      name: 'Midnight Roleplay',
      domain: 'midnight.fivecachesite.vercel.app',
      blocked: false,
      plan: 'hobby',
    },
  ],
  selected: { id: 'srv_demo_1', serverId: 'sharkcity', name: 'SharkCITY FiveM RP' },
  stats: {
    serverId: 'sharkcity',
    name: 'SharkCITY FiveM RP',
    domain: 'sharkcity.fivecachesite.vercel.app',
    cacheUrl: 'https://sharkcity.fivecachesite.vercel.app/files',
    blocked: false,
    resetDate: '2026-12-31',
    plan: 'pro_plus',
    totals: {
      requests: 1248590,
      bandwidthUsed: 137438953472,
      bandwidthUsedFormatted: '128 GB',
      storageUsed: 13315571712,
      storageUsedFormatted: '12.4 GB',
      cacheHitRate: 0.94,
      filesCached: 1845,
    },
    statusCodes: {
      '2xx': 1173674,
      '3xx': 62429,
      '4xx': 12485,
      '5xx': 2,
      total: 1248590,
      percentages: { '2xx': 94.0, '3xx': 5.0, '4xx': 1.0, '5xx': 0.0 },
    },
    topCountries: [
      { id: '1', country: 'Vietnam', code: 'VN', requests: 940200 },
      { id: '2', country: 'United States', code: 'US', requests: 154200 },
      { id: '3', country: 'Germany', code: 'DE', requests: 84300 },
      { id: '4', country: 'Japan', code: 'JP', requests: 45200 },
      { id: '5', country: 'Singapore', code: 'SG', requests: 24690 },
    ],
    topFiles: [
      { id: '1', file: 'stream/vehicles/police.ytd', requests: 128450 },
      { id: '2', file: 'stream/maps/pd_interior.ybn', requests: 98400 },
      { id: '3', file: 'stream/clothes/ems_uniform.ydd', requests: 84200 },
      { id: '4', file: 'stream/audio/sfx.awc', requests: 62100 },
      { id: '5', file: 'stream/vehicles/civ_car.yft', requests: 45300 },
    ],
    monthlyStats: [
      { month: '2026-06', requests: 820000, bandwidth: 85899345920, bandwidthFormatted: '80 GB', hitRate: 0.91 },
      { month: '2026-07', requests: 940000, bandwidth: 96636764160, bandwidthFormatted: '90 GB', hitRate: 0.92 },
      { month: '2026-08', requests: 1050000, bandwidth: 107374182400, bandwidthFormatted: '100 GB', hitRate: 0.93 },
      { month: '2026-09', requests: 1120000, bandwidth: 118111600640, bandwidthFormatted: '110 GB', hitRate: 0.93 },
      { month: '2026-10', requests: 1190000, bandwidth: 123480309760, bandwidthFormatted: '115 GB', hitRate: 0.94 },
      { month: '2026-11', requests: 1248590, bandwidth: 137438953472, bandwidthFormatted: '128 GB', hitRate: 0.94 },
    ],
  },
}

export async function GET(req: NextRequest) {
  const { user } = await requireUser(req)

  if (!isDbConfigured()) {
    return NextResponse.json(DEMO_STATS)
  }

  try {
    const servers = await db.cacheServer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: {
        topCountries: { orderBy: { requests: 'desc' }, take: 6 },
        topFiles: { orderBy: { requests: 'desc' }, take: 6 },
      },
    })

    if (servers.length === 0) {
      return NextResponse.json(DEMO_STATS)
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
  } catch {
    return NextResponse.json(DEMO_STATS)
  }
}
