import { NextRequest, NextResponse } from 'next/server'
import { db, isDbConfigured } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// Global in-memory balance store for demo environments
const globalBalanceStore = globalThis as unknown as {
  demoBalances?: Map<string, number>
}
if (!globalBalanceStore.demoBalances) {
  globalBalanceStore.demoBalances = new Map<string, number>()
}

// POST /api/shield/topup-balance { amount: number }
export async function POST(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  try {
    const body = await req.json()
    const amount = Math.floor(Number(body.amount) || 0)
    if (amount <= 0 || amount > 100_000_000_000) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 })
    }

    if (!isDbConfigured()) {
      const current = globalBalanceStore.demoBalances!.get(user.id) ?? 500_000
      const newBalance = current + amount
      globalBalanceStore.demoBalances!.set(user.id, newBalance)
      return NextResponse.json({ ok: true, newBalance })
    }

    const updated = await db.$transaction(async (tx) => {
      const fresh = await tx.user.findUnique({ where: { id: user.id } })
      if (!fresh) throw new Error('User not found')
      const newBalance = fresh.balanceVnd + amount
      await tx.user.update({ where: { id: user.id }, data: { balanceVnd: newBalance } })
      await tx.balanceTransaction.create({
        data: {
          userId: user.id,
          amount,
          type: 'topup',
        },
      })
      return newBalance
    })

    return NextResponse.json({ ok: true, newBalance: updated })
  } catch (e) {
    console.error('Topup error:', e)
    return NextResponse.json({ error: 'Top-up failed.' }, { status: 500 })
  }
}
