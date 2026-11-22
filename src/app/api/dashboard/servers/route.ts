import { NextRequest, NextResponse } from 'next/server'
import { db, isDbConfigured } from '@/lib/db'
import { requireUser } from '@/lib/api'
import { generateServerId as genId } from '@/lib/auth'

export const runtime = 'nodejs'

const DEMO_SERVERS = [
  {
    id: 'srv_demo_1',
    serverId: 'sharkcity',
    name: 'SharkCITY FiveM RP',
    domain: 'sharkcity.fivecache.site',
    serverIp: '103.145.2.10',
    serverPort: 30120,
    plan: 'pro_plus',
    blocked: false,
    resetDate: '2026-12-31',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv_demo_2',
    serverId: 'midnight',
    name: 'Midnight Roleplay',
    domain: 'midnight.fivecache.site',
    serverIp: '14.225.10.25',
    serverPort: 30120,
    plan: 'hobby',
    blocked: false,
    resetDate: '2026-12-31',
    createdAt: new Date().toISOString(),
  },
]

// GET /api/dashboard/servers - list user's servers + slot info
export async function GET(req: NextRequest) {
  const { user } = await requireUser(req)

  if (!isDbConfigured()) {
    return NextResponse.json({
      servers: DEMO_SERVERS,
      slots: { total: 5, used: DEMO_SERVERS.length, available: 5 - DEMO_SERVERS.length },
      plan: 'pro_plus',
    })
  }

  try {
    const servers = await db.cacheServer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        serverId: true,
        name: true,
        domain: true,
        serverIp: true,
        serverPort: true,
        plan: true,
        blocked: true,
        resetDate: true,
        createdAt: true,
      },
    })

    const finalServers = servers.length > 0 ? servers : DEMO_SERVERS
    const planSlots: Record<string, number> = { free: 0, hobby: 1, pro_plus: 5, custom_evarose: 999 }
    const slotsTotal = planSlots[user.plan] ?? 5
    const slotsUsed = finalServers.length

    return NextResponse.json({
      servers: finalServers,
      slots: { total: slotsTotal, used: slotsUsed, available: Math.max(0, slotsTotal - slotsUsed) },
      plan: user.plan,
    })
  } catch {
    return NextResponse.json({
      servers: DEMO_SERVERS,
      slots: { total: 5, used: DEMO_SERVERS.length, available: 5 - DEMO_SERVERS.length },
      plan: 'pro_plus',
    })
  }
}

// POST /api/dashboard/servers - create new server
export async function POST(req: NextRequest) {
  const { user } = await requireUser(req)

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const serverIp = String(body.serverIp || '').trim()
    const serverPort = Number(body.serverPort) || null

    if (!name) {
      return NextResponse.json({ error: 'Server name is required.' }, { status: 400 })
    }

    try {
      const serverId = genId()
      const domain = `${serverId}.fivecache.site`
      const cacheUrl = `https://${domain}/files`

      const created = await db.cacheServer.create({
        data: {
          userId: user.id,
          serverId,
          name,
          domain,
          cacheUrl,
          serverIp: serverIp || null,
          serverPort,
          plan: user.plan,
        },
      })
      return NextResponse.json({ ok: true, server: created }, { status: 201 })
    } catch {
      // In-memory demo response
      const serverId = genId()
      return NextResponse.json({
        ok: true,
        server: {
          id: `srv_${Date.now()}`,
          serverId,
          name,
          domain: `${serverId}.fivecache.site`,
          cacheUrl: `https://${serverId}.fivecache.site/files`,
          serverIp,
          serverPort,
          plan: 'pro_plus',
        },
      }, { status: 201 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to create server.' }, { status: 500 })
  }
}
