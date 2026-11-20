import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'
import { generateServerId as genId } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/dashboard/servers - list user's servers + slot info
export async function GET(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

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

  // Determine slot limits based on user's plan
  const planSlots: Record<string, number> = { free: 0, hobby: 1, pro_plus: 5, custom_evarose: 999 }
  const slotsTotal = planSlots[user.plan] ?? 0
  const slotsUsed = servers.length

  return NextResponse.json({
    servers,
    slots: { total: slotsTotal, used: slotsUsed, available: Math.max(0, slotsTotal - slotsUsed) },
    plan: user.plan,
  })
}

// POST /api/dashboard/servers - create new server
export async function POST(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const serverIp = String(body.serverIp || '').trim()
    const serverPort = Number(body.serverPort) || null

    if (!name) {
      return NextResponse.json({ error: 'Server name is required.' }, { status: 400 })
    }

    const existing = await db.cacheServer.count({ where: { userId: user.id } })
    const planSlots: Record<string, number> = { free: 0, hobby: 1, pro_plus: 5, custom_evarose: 999 }
    const slotsTotal = planSlots[user.plan] ?? 0
    if (existing >= slotsTotal) {
      return NextResponse.json(
        { error: 'You do not have any free subscription slots available.' },
        { status: 403 },
      )
    }

    // Generate a unique SERVER_ID
    let serverId = genId()
    // Ensure unique
    while (await db.cacheServer.findUnique({ where: { serverId } })) {
      serverId = genId()
    }
    const domain = `${serverId}.fivecache.site`
    const cacheUrl = `https://${domain}/files`

    const server = await db.cacheServer.create({
      data: {
        userId: user.id,
        serverId,
        name,
        serverIp: serverIp || null,
        serverPort: serverPort || null,
        domain,
        cacheUrl,
        plan: user.plan,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    })

    return NextResponse.json({ ok: true, server })
  } catch (e) {
    console.error('Create server error:', e)
    return NextResponse.json({ error: 'Failed to create server.' }, { status: 500 })
  }
}

// PATCH /api/dashboard/servers - update server config
export async function PATCH(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  try {
    const body = await req.json()
    const { id, name, serverIp, serverPort } = body
    if (!id) return NextResponse.json({ error: 'Server id is required.' }, { status: 400 })

    const owned = await db.cacheServer.findFirst({ where: { id, userId: user.id } })
    if (!owned) {
      return NextResponse.json({ error: 'Server not found.' }, { status: 404 })
    }

    const updated = await db.cacheServer.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : undefined,
        serverIp: serverIp !== undefined ? String(serverIp).trim() || null : undefined,
        serverPort:
          serverPort !== undefined ? (serverPort ? Number(serverPort) : null) : undefined,
      },
    })

    return NextResponse.json({ ok: true, server: updated })
  } catch (e) {
    console.error('Update server error:', e)
    return NextResponse.json({ error: 'Failed to save configuration.' }, { status: 500 })
  }
}

// DELETE /api/dashboard/servers?id=... - delete server
export async function DELETE(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Server id is required.' }, { status: 400 })

  const owned = await db.cacheServer.findFirst({ where: { id, userId: user.id } })
  if (!owned) {
    return NextResponse.json({ error: 'Server not found.' }, { status: 404 })
  }

  await db.cacheServer.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
