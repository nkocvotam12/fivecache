import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// POST /api/shield/[id]/cancel
// Cancels the shield subscription. Data is retained (status=cancelled) but
// the shield stops serving files immediately.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  // Refund the unused remaining days (prorated)
  const now = Date.now()
  const totalMs = 30 * 24 * 60 * 60 * 1000
  const remainingMs = shield.expiresAt.getTime() - now
  if (remainingMs > 0 && shield.status === 'active') {
    const refundAmount = Math.floor(shield.pricePerMonth * (remainingMs / totalMs))
    if (refundAmount > 0) {
      await db.$transaction(async (tx) => {
        const fresh = await tx.user.findUnique({ where: { id: user.id } })
        if (!fresh) return
        await tx.user.update({
          where: { id: user.id },
          data: { balanceVnd: fresh.balanceVnd + refundAmount },
        })
        await tx.balanceTransaction.create({
          data: {
            userId: user.id,
            amount: refundAmount,
            type: 'shield_cancel_refund',
            reference: shield.id,
          },
        })
      })
    }
  }

  await db.shieldServer.update({
    where: { id: shield.id },
    data: { status: 'cancelled', autoRenew: false },
  })
  // Invalidate all live tokens
  await db.shieldToken.deleteMany({ where: { shieldId: shield.id } })

  const updated = await db.user.findUnique({ where: { id: user.id } })
  return NextResponse.json({
    ok: true,
    newBalance: updated?.balanceVnd ?? user.balanceVnd,
  })
}
