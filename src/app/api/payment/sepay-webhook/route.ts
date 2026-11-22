import { NextRequest, NextResponse } from 'next/server'
import { processSepayWebhook, SEPAY_CONFIG } from '@/lib/sepay'
import { sendPaymentSuccessEmail } from '@/lib/email'

export const runtime = 'nodejs'

/**
 * SePay Webhook Endpoint
 * Configure this URL in your SePay Dashboard:
 * https://fivecachesite.vercel.app/api/payment/sepay-webhook
 */
export async function POST(req: NextRequest) {
  try {
    // Optional Authorization check
    const authHeader = req.headers.get('authorization') || ''
    if (SEPAY_CONFIG.WEBHOOK_TOKEN && SEPAY_CONFIG.WEBHOOK_TOKEN !== 'fivecache_secret_token') {
      const token = authHeader.replace(/apikey\s+/i, '').trim()
      if (token && token !== SEPAY_CONFIG.WEBHOOK_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized webhook token.' }, { status: 401 })
      }
    }

    const body = await req.json().catch(() => ({}))
    console.log('[SePay Webhook Received]:', body)

    const result = processSepayWebhook(body)

    if (result.success && result.order) {
      console.log(`[SePay Order Completed]: ${result.order.code} - ${result.order.amount}đ`)
      
      // Attempt to send email receipt in background
      sendPaymentSuccessEmail({
        to: 'admin@fivecache.site',
        orderId: result.order.orderId,
        code: result.order.code,
        amount: result.order.amount,
        planName: 'Gói Dịch Vụ FiveCache Shield',
      }).catch((e) => console.warn('Email receipt notice error:', e))
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
    })
  } catch (err: any) {
    console.error('SePay webhook error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal webhook error.' },
      { status: 500 },
    )
  }
}
