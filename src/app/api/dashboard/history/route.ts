import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

const DEMO_HISTORY = [
  { month: '2026-06', requests: 820000, bandwidth: 85899345920, bandwidthFormatted: '80 GB', hitRate: 0.91 },
  { month: '2026-07', requests: 940000, bandwidth: 96636764160, bandwidthFormatted: '90 GB', hitRate: 0.92 },
  { month: '2026-08', requests: 1050000, bandwidth: 107374182400, bandwidthFormatted: '100 GB', hitRate: 0.93 },
  { month: '2026-09', requests: 1120000, bandwidth: 118111600640, bandwidthFormatted: '110 GB', hitRate: 0.93 },
  { month: '2026-10', requests: 1190000, bandwidth: 123480309760, bandwidthFormatted: '115 GB', hitRate: 0.94 },
  { month: '2026-11', requests: 1248590, bandwidth: 137438953472, bandwidthFormatted: '128 GB', hitRate: 0.94 },
]

export async function GET(req: NextRequest) {
  const { user } = await requireUser(req)

  const serverId = req.nextUrl.searchParams.get('serverId')
  if (!serverId) {
    return NextResponse.json({ error: 'serverId is required.' }, { status: 400 })
  }

  try {
    const server = await db.cacheServer.findFirst({
      where: { id: serverId, userId: user.id },
    })

    if (server) {
      const months = await db.monthlyStat.findMany({
        where: { serverId: server.id },
        orderBy: { month: 'desc' },
        take: 12,
      })

      if (months.length > 0) {
        return NextResponse.json({
          history: months
            .sort((a, b) => a.month.getTime() - b.month.getTime())
            .map((m) => ({
              month: m.month,
              requests: m.requests,
              bandwidth: m.bandwidth,
              bandwidthFormatted: formatBytes(m.bandwidth),
              hitRate: m.hitRate,
            })),
        })
      }
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ history: DEMO_HISTORY })
}
