import { NextRequest, NextResponse } from 'next/server'
import { issueTicket, verifyTicket, DEFAULT_TICKET_TTL_SECONDS } from './ticket'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Launcher-Version, X-License, X-HWID',
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  return '127.0.0.1'
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export async function handlePost(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)
    let body: Record<string, any> = {}

    try {
      body = await req.json()
    } catch {
      // If body is empty or not JSON, check query params or form-data
      const url = new URL(req.url)
      url.searchParams.forEach((val, key) => {
        body[key] = val
      })
    }

    // Check if this is a verification request
    const action = String(body.action || '').toLowerCase()
    const checkTicket = body.ticket || body.token
    if (action === 'verify' || (checkTicket && !body.license && !body.hwid)) {
      const result = verifyTicket(String(checkTicket || ''), clientIp)
      return NextResponse.json(
        {
          ok: result.valid,
          status: result.valid ? 'success' : 'error',
          valid: result.valid,
          reason: result.reason,
          ticket: result.ticket,
        },
        { status: result.valid ? 200 : 400, headers: CORS_HEADERS },
      )
    }

    // Otherwise issue a new ticket
    const license = String(body.license || body.playerLicense || body.identifier || '').trim()
    const name = String(body.name || body.playerName || body.username || '').trim()
    const hwid = String(body.hwid || body.hardwareId || '').trim()
    const serverCode = String(body.serverCode || body.server || body.code || 'default').trim()
    const launcherVersion = String(body.launcherVersion || body.version || '1.0.0').trim()
    const ttlSeconds = Number(body.ttl || body.ttlSeconds || body.expiresIn) || DEFAULT_TICKET_TTL_SECONDS

    const ticket = issueTicket({
      license: license || undefined,
      name: name || undefined,
      ip: body.ip ? String(body.ip).trim() : clientIp,
      hwid: hwid || undefined,
      serverCode,
      launcherVersion,
      ttlSeconds,
      metadata: body.metadata || {},
    })

    return NextResponse.json(
      {
        ok: true,
        status: 'success',
        message: 'Ticket issued successfully',
        ticket: ticket.ticket,
        token: ticket.ticket, // alias
        expiresAt: ticket.expiresAt,
        expiresIn: ticket.expiresInSeconds,
        player: {
          license: ticket.license,
          name: ticket.name,
          ip: ticket.ip,
          hwid: ticket.hwid,
        },
        server: {
          code: ticket.serverCode,
          cacheUrl: `https://fivecachesite.vercel.app/files`,
          status: 'online',
        },
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err: any) {
    console.error('Ticket handler error:', err)
    return NextResponse.json(
      {
        ok: false,
        status: 'error',
        error: 'Failed to process ticket request',
        details: err?.message,
      },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

export async function handleGet(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)
    const url = new URL(req.url)
    const ticketParam = url.searchParams.get('ticket') || url.searchParams.get('token')
    const action = url.searchParams.get('action')

    // If ticket is specified, verify it
    if (ticketParam || action === 'verify') {
      const code = ticketParam || ''
      const result = verifyTicket(code, clientIp)
      return NextResponse.json(
        {
          ok: result.valid,
          status: result.valid ? 'success' : 'error',
          valid: result.valid,
          reason: result.reason,
          ticket: result.ticket,
        },
        { status: result.valid ? 200 : 400, headers: CORS_HEADERS },
      )
    }

    // Otherwise, issue a ticket via GET parameters
    const license = url.searchParams.get('license') || url.searchParams.get('playerLicense') || undefined
    const name = url.searchParams.get('name') || url.searchParams.get('playerName') || undefined
    const hwid = url.searchParams.get('hwid') || undefined
    const serverCode = url.searchParams.get('server') || url.searchParams.get('code') || 'default'
    const launcherVersion = url.searchParams.get('version') || '1.0.0'
    const ttlSeconds = Number(url.searchParams.get('ttl')) || DEFAULT_TICKET_TTL_SECONDS

    const ticket = issueTicket({
      license,
      name,
      ip: clientIp,
      hwid,
      serverCode,
      launcherVersion,
      ttlSeconds,
    })

    return NextResponse.json(
      {
        ok: true,
        status: 'success',
        message: 'Ticket issued successfully',
        ticket: ticket.ticket,
        token: ticket.ticket, // alias
        expiresAt: ticket.expiresAt,
        expiresIn: ticket.expiresInSeconds,
        player: {
          license: ticket.license,
          name: ticket.name,
          ip: ticket.ip,
          hwid: ticket.hwid,
        },
        server: {
          code: ticket.serverCode,
          cacheUrl: `https://fivecachesite.vercel.app/files`,
          status: 'online',
        },
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err: any) {
    console.error('Ticket GET error:', err)
    return NextResponse.json(
      {
        ok: false,
        status: 'error',
        error: 'Failed to process ticket request',
      },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}
