/**
 * Resend Email Integration for FiveCache
 * Sends transactional emails via Resend REST API (zero extra dependencies).
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_'))
}

/**
 * Send raw email using Resend REST API
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'FiveCache <billing@fivecache.site>'

  if (!apiKey || !isEmailConfigured()) {
    console.log('[Resend Mock] RESEND_API_KEY is not set. Simulating email dispatch:')
    console.log(`  To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
    console.log(`  Subject: ${options.subject}`)
    return {
      success: true,
      id: `mock_email_${Date.now()}`,
    }
  }

  try {
    const toList = Array.isArray(options.to) ? options.to : [options.to]
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toList,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('[Resend Error]', data)
      return { success: false, error: data.message || 'Failed to send email via Resend' }
    }

    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('[Resend Exception]', err)
    return { success: false, error: err.message || 'Unknown network error' }
  }
}

/**
 * Send Payment Confirmation Email
 */
export async function sendPaymentSuccessEmail(params: {
  to: string
  orderId: string
  code: string
  amount: number
  planName?: string
  serverName?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedAmount = params.amount.toLocaleString('vi-VN') + ' VNĐ'
  const subject = `[FiveCache] Xác nhận thanh toán thành công - Đơn hàng #${params.code}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 24px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #eab308; letter-spacing: -0.5px; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-top: 12px; }
          .title { font-size: 20px; font-weight: bold; margin: 16px 0 8px 0; color: #ffffff; }
          .details { background: #27272a; border-radius: 8px; padding: 16px; margin: 24px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3f3f46; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #a1a1aa; }
          .val { font-weight: 600; color: #ffffff; }
          .amount { font-size: 20px; font-weight: bold; color: #eab308; }
          .footer { text-align: center; font-size: 12px; color: #71717a; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 24px; }
          .btn { display: inline-block; background: #eab308; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ FiveCache CDN</div>
            <div class="badge">THANH TOÁN THÀNH CÔNG</div>
            <div class="title">Cảm ơn bạn đã tin dùng FiveCache!</div>
          </div>

          <p>Hệ thống đã ghi nhận giao dịch nạp tiền / thanh toán của bạn thành công qua cổng VietQR SePay.</p>

          <div class="details">
            <div class="row">
              <span class="label">Mã đơn hàng:</span>
              <span class="val">${params.orderId}</span>
            </div>
            <div class="row">
              <span class="label">Nội dung chuyển khoản:</span>
              <span class="val">${params.code}</span>
            </div>
            <div class="row">
              <span class="label">Dịch vụ:</span>
              <span class="val">${params.planName || 'FiveCache Shield CDN Anti-dump'}</span>
            </div>
            ${params.serverName ? `
            <div class="row">
              <span class="label">Server FiveM:</span>
              <span class="val">${params.serverName}</span>
            </div>` : ''}
            <div class="row">
              <span class="label">Số tiền:</span>
              <span class="val amount">${formattedAmount}</span>
            </div>
            <div class="row">
              <span class="label">Thời gian:</span>
              <span class="val">${new Date().toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://fivecachesite.vercel.app/dashboard" class="btn">Quản lý Server trên Dashboard</a>
          </div>

          <div class="footer">
            <p>FiveCache Vietnam — Hệ thống CDN Cache & Anti-dump FiveM tốc độ cao.</p>
            <p>Hỗ trợ kỹ thuật: support@fivecache.site | Discord: discord.gg/fivecache</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: params.to,
    subject,
    html,
    text: `FiveCache: Giao dịch ${params.code} thanh toán thành công số tiền ${formattedAmount}.`,
  })
}

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail(params: {
  to: string
  name?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const subject = `Chào mừng đến với FiveCache CDN — Hệ thống tăng tốc & Anti-dump FiveM`
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px;">
          <h2 style="color: #eab308;">Xin chào ${params.name || 'Game Server Admin'},</h2>
          <p>Chào mừng bạn gia nhập cộng đồng FiveCache — giải pháp CDN Edge Caching & Anti-Dump chuyên nghiệp cho FiveM Server tại Việt Nam.</p>
          <ul>
            <li>Tối ưu tốc độ tải xe, maps, quần áo, mods lên tới 300%</li>
            <li>Bảo vệ tài nguyên server với 4 lớp Shield Anti-dump độc quyền</li>
            <li>Cơ chế mã hóa adhesive_cdnKey tự động</li>
          </ul>
          <p><a href="https://fivecachesite.vercel.app/dashboard" style="display:inline-block; padding: 10px 20px; background: #eab308; color: #000; font-weight: bold; border-radius: 6px; text-decoration: none;">Vào Dashboard ngay</a></p>
        </div>
      </body>
    </html>
  `
  return sendEmail({ to: params.to, subject, html })
}
