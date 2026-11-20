import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// GET /api/shield/[id]/logs?limit=50
// Recent access log entries for forensics
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const limit = Math.min(100, Number(req.nextUrl.searchParams.get('limit') || 50))
  const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  const logs = await db.shieldAccessLog.findMany({
    where: { shieldId: shield.id },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      playerIp: l.playerIp,
      playerLicense: l.playerLicense,
      filePath: l.filePath,
      status: l.status,
      reason: l.reason,
      bytesServed: l.bytesServed,
    })),
  })
}
