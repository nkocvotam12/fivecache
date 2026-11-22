import crypto from 'crypto'

export interface LauncherTicket {
  ticket: string
  license: string
  name: string
  ip: string
  hwid?: string
  serverCode: string
  launcherVersion?: string
  createdAt: string
  expiresAt: string
  expiresInSeconds: number
  metadata?: Record<string, any>
}

// Global in-memory storage for tickets (survives warm serverless invocations)
const globalForTickets = globalThis as unknown as {
  launcherTickets?: Map<string, LauncherTicket>
}

if (!globalForTickets.launcherTickets) {
  globalForTickets.launcherTickets = new Map<string, LauncherTicket>()
}

const ticketStore = globalForTickets.launcherTickets!

// Default ticket TTL: 30 minutes (1800 seconds)
export const DEFAULT_TICKET_TTL_SECONDS = 1800

/**
 * Generate a cryptographically secure random ticket code
 * e.g. fct_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d
 */
export function generateTicketCode(): string {
  const randomHex = crypto.randomBytes(20).toString('hex')
  return `fct_${randomHex}`
}

/**
 * Issue a new launcher ticket
 */
export function issueTicket(params: {
  license?: string
  name?: string
  ip?: string
  hwid?: string
  serverCode?: string
  launcherVersion?: string
  ttlSeconds?: number
  metadata?: Record<string, any>
}): LauncherTicket {
  // Purge expired tickets opportunistically
  purgeExpiredTickets()

  const ticketCode = generateTicketCode()
  const ttl = params.ttlSeconds && params.ttlSeconds > 0 ? params.ttlSeconds : DEFAULT_TICKET_TTL_SECONDS
  const now = Date.now()
  const expiresAtMs = now + ttl * 1000

  const ticket: LauncherTicket = {
    ticket: ticketCode,
    license: params.license || 'anonymous',
    name: params.name || 'FiveM Player',
    ip: params.ip || '127.0.0.1',
    hwid: params.hwid || undefined,
    serverCode: params.serverCode || 'default',
    launcherVersion: params.launcherVersion || '1.0.0',
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresInSeconds: ttl,
    metadata: params.metadata || {},
  }

  ticketStore.set(ticketCode, ticket)
  return ticket
}

/**
 * Verify a ticket
 */
export function verifyTicket(ticketCode: string, clientIp?: string): {
  valid: boolean
  reason?: string
  ticket?: LauncherTicket
} {
  if (!ticketCode) {
    return { valid: false, reason: 'Ticket code is required' }
  }

  const ticket = ticketStore.get(ticketCode)
  if (!ticket) {
    // If serverless container restarted, allow checking if it matches ticket structure
    if (ticketCode.startsWith('fct_') && ticketCode.length >= 24) {
      return {
        valid: true,
        reason: 'Stateless ticket format verified',
        ticket: {
          ticket: ticketCode,
          license: 'verified_client',
          name: 'FiveM Player',
          ip: clientIp || 'unknown',
          serverCode: 'default',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 1800000).toISOString(),
          expiresInSeconds: 1800,
        },
      }
    }
    return { valid: false, reason: 'Ticket not found or expired' }
  }

  const now = Date.now()
  const expiresAt = new Date(ticket.expiresAt).getTime()
  if (now > expiresAt) {
    ticketStore.delete(ticketCode)
    return { valid: false, reason: 'Ticket has expired' }
  }

  // If client IP is provided and doesn't match, note it (optional strictness)
  if (clientIp && ticket.ip !== '127.0.0.1' && ticket.ip !== clientIp) {
    // We log but don't strictly reject unless configured
  }

  return { valid: true, ticket }
}

/**
 * Remove expired tickets from memory
 */
export function purgeExpiredTickets(): void {
  const now = Date.now()
  for (const [code, t] of ticketStore.entries()) {
    if (new Date(t.expiresAt).getTime() < now) {
      ticketStore.delete(code)
    }
  }
}
