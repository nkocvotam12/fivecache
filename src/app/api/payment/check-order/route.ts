import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/sepay'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const idOrCode = url.searchParams.get('orderId') || url.searchParams.get('code') || ''

  if (!idOrCode) {
    return NextResponse.json({ error: 'Thiếu orderId hoặc code.' }, { status: 400 })
  }

  const order = getOrder(idOrCode)
  if (!order) {
    return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    status: order.status,
    isPaid: order.status === 'COMPLETED',
    order,
  })
}
