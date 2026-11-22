import { NextRequest, NextResponse } from 'next/server'
import { createPaymentOrder } from '@/lib/sepay'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser(req)
    const body = await req.json().catch(() => ({}))
    const amount = Number(body.amount) || 299000
    const note = String(body.note || 'Nap tien FiveCache')

    if (amount < 10000) {
      return NextResponse.json(
        { error: 'Số tiền tối thiểu là 10.000đ.' },
        { status: 400 },
      )
    }

    const order = createPaymentOrder({
      amount,
      userId: user.id,
      note,
    })

    return NextResponse.json({
      ok: true,
      order,
    })
  } catch (err: any) {
    console.error('Create order error:', err)
    return NextResponse.json(
      { error: 'Không thể tạo đơn thanh toán.' },
      { status: 500 },
    )
  }
}
