import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const shield = await db.shieldServer.findFirst({
    where: { id, userId: user.id },
    include: {
      _count: { select: { logs: true, tokens: true } },
    },
  })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  return NextResponse.json({
    shield: {
      id: shield.id,
      code: shield.code,
      name: shield.name,
      domain: shield.domain,
      cacheUrl: shield.cacheUrl,
      adhesiveKey: shield.adhesiveKey,
      originHost: shield.originHost,
      originPort: shield.originPort,
      protocol: shield.protocol,
      status: shield.status,
      pricePerMonth: shield.pricePerMonth,
      expiresAt: shield.expiresAt,
      autoRenew: shield.autoRenew,
      totalRequests: shield.totalRequests,
      blockedRequests: shield.blockedRequests,
      bandwidthServed: shield.bandwidthServed,
      uniquePlayers: shield.uniquePlayers,
      createdAt: shield.createdAt,
    },
    configLines: {
      adhesive: `set adhesive_cdnKey "${shield.adhesiveKey}"`,
      fileserver: `fileserver_add "*" "${shield.cacheUrl}"`,
    },
    counts: shield._count,
  })
}
