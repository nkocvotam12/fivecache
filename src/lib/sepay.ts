import crypto from 'crypto'

export interface PaymentOrder {
  orderId: string
  code: string // Content code like FCP12345
  amount: number
  userId: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  note?: string
  qrUrl: string
  bankInfo: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  createdAt: string
  expiresAt: string
  completedAt?: string
  transactionId?: string
}

// Global in-memory storage for orders (survives warm invocations)
const globalForSepay = globalThis as unknown as {
  sepayOrders?: Map<string, PaymentOrder>
}

if (!globalForSepay.sepayOrders) {
  globalForSepay.sepayOrders = new Map<string, PaymentOrder>()
}

const ordersStore = globalForSepay.sepayOrders!

// Default Bank Information (Can be configured via .env)
export const SEPAY_CONFIG = {
  BANK_NAME: process.env.SEPAY_BANK_NAME || 'MBBank',
  ACCOUNT_NUMBER: process.env.SEPAY_ACCOUNT_NUMBER || '0987654321',
  ACCOUNT_NAME: process.env.SEPAY_ACCOUNT_NAME || 'FIVECACHE VIETNAM',
  API_KEY: process.env.SEPAY_API_KEY || '',
  WEBHOOK_TOKEN: process.env.SEPAY_WEBHOOK_TOKEN || 'fivecache_secret_token',
}

/**
 * Generate a short payment code: e.g. FCP84920
 */
export function generateOrderCode(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `FCP${randomNum}`
}

/**
 * Create a new VietQR Payment Order
 */
export function createPaymentOrder(params: {
  amount: number
  userId?: string
  note?: string
}): PaymentOrder {
  const code = generateOrderCode()
  const orderId = `ORD_${Date.now()}_${code}`
  const now = Date.now()
  const expiresAt = new Date(now + 15 * 60 * 1000).toISOString() // 15 mins

  const bankName = process.env.SEPAY_BANK_NAME || SEPAY_CONFIG.BANK_NAME
  const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || SEPAY_CONFIG.ACCOUNT_NUMBER
  const accountName = process.env.SEPAY_ACCOUNT_NAME || SEPAY_CONFIG.ACCOUNT_NAME

  // VietQR Napas standard URL from SePay CDN
  const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(accountNumber)}&bank=${encodeURIComponent(bankName)}&amount=${params.amount}&des=${encodeURIComponent(code)}&template=compact`

  const order: PaymentOrder = {
    orderId,
    code,
    amount: params.amount,
    userId: params.userId || 'usr_demo_admin',
    status: 'PENDING',
    note: params.note || 'Nap tien FiveCache',
    qrUrl,
    bankInfo: {
      bankName,
      accountNumber,
      accountName,
    },
    createdAt: new Date(now).toISOString(),
    expiresAt,
  }

  ordersStore.set(orderId, order)
  ordersStore.set(code, order) // also index by short code for fast webhook lookup

  return order
}

/**
 * Get order by ID or short Code
 */
export function getOrder(idOrCode: string): PaymentOrder | undefined {
  return ordersStore.get(idOrCode)
}

/**
 * Mark order as completed
 */
export function completeOrder(idOrCode: string, transactionId?: string): PaymentOrder | undefined {
  const order = ordersStore.get(idOrCode)
  if (!order) return undefined

  order.status = 'COMPLETED'
  order.completedAt = new Date().toISOString()
  if (transactionId) order.transactionId = transactionId

  ordersStore.set(order.orderId, order)
  ordersStore.set(order.code, order)
  return order
}

/**
 * Process incoming SePay Webhook
 */
export function processSepayWebhook(data: any): {
  success: boolean
  message: string
  order?: PaymentOrder
} {
  // Support both snake_case (SePay official) and camelCase
  const transferType = String(data.transferType || data.transfer_type || data.type || 'in').toLowerCase()
  if (transferType !== 'in') {
    return { success: false, message: 'Ignored: not an incoming transfer.' }
  }

  const content = String(data.content || data.description || data.transaction_content || data.code || '')
  const amount = Number(data.transferAmount || data.transfer_amount || data.amount) || 0
  const gateway = data.gateway || data.bank_brand_name || 'Bank'
  const accountNumber = data.accountNumber || data.account_number || ''
  const referenceCode = data.referenceCode || data.reference_number || data.id || `TX_${Date.now()}`

  // Extract code: e.g. FCP12345, FCP 12345, or case-insensitive
  const match = content.match(/FCP\s*(\d{4,8})/i)
  if (!match) {
    return {
      success: false,
      message: `No matching FCP order code found in transaction content: "${content}"`,
    }
  }

  const code = `FCP${match[1]}`
  const order = getOrder(code)

  if (!order) {
    // If order was created in another container, create a fulfilled record
    const syntheticOrder: PaymentOrder = {
      orderId: `ORD_SYN_${Date.now()}`,
      code,
      amount,
      userId: 'usr_demo_admin',
      status: 'COMPLETED',
      qrUrl: '',
      bankInfo: {
        bankName: data.gateway || 'Bank',
        accountNumber: data.accountNumber || '',
        accountName: '',
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      transactionId: data.referenceCode,
    }
    ordersStore.set(code, syntheticOrder)
    return { success: true, message: 'Order created and fulfilled from webhook data.', order: syntheticOrder }
  }

  if (order.status === 'COMPLETED') {
    return { success: true, message: 'Order was already completed.', order }
  }

  const completed = completeOrder(code, data.referenceCode)
  return { success: true, message: 'Order marked as completed successfully.', order: completed }
}
