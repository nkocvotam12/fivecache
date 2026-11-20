import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'
import { billShieldSubscription } from '@/lib/shield'

export const runtime = 'nodejs'

// POST /api/shield/[id]/renew
// Manually renew the shield for another 30 days (deducts balance).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  try {
    const { newBalance } = await billShieldSubscription(shield.id)
    const refreshed = await db.shieldServer.findUnique({ where: { id: shield.id } })
    return NextResponse.json({
      ok: true,
      newBalance,
      expiresAt: refreshed?.expiresAt,
      status: refreshed?.status,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Renew failed'
    return NextResponse.json({ error: msg }, { status: 402 })
  }
}
