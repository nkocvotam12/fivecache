import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

// GET /api/dashboard/history?serverId=...
// Returns the last N months of usage data
export async function GET(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const serverId = req.nextUrl.searchParams.get('serverId')
  if (!serverId) {
    return NextResponse.json({ error: 'serverId is required.' }, { status: 400 })
  }

  const server = await db.cacheServer.findFirst({
    where: { id: serverId, userId: user.id },
  })
  if (!server) {
    return NextResponse.json({ error: 'Server not found.' }, { status: 404 })
  }

  const months = await db.monthlyStat.findMany({
    where: { serverId: server.id },
    orderBy: { month: 'desc' },
    take: 12,
  })

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
