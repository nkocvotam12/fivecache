import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// POST /api/dashboard/config - save FiveM server config
// Body: { serverId: <cacheServer.id>, name, serverIp, serverPort }
export async function POST(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  try {
    const body = await req.json()
    const id = String(body.serverId || '')
    const name = String(body.name || '').trim()
    const serverIp = String(body.serverIp || '').trim()
    const serverPort = Number(body.serverPort) || null

    if (!id) {
      return NextResponse.json({ error: 'Server id is required.' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'Server name is required.' }, { status: 400 })
    }

    const owned = await db.cacheServer.findFirst({ where: { serverId: id, userId: user.id } })
    if (!owned) {
      return NextResponse.json({ error: 'Server not found.' }, { status: 404 })
    }

    const updated = await db.cacheServer.update({
      where: { id: owned.id },
      data: {
        name,
        serverIp: serverIp || null,
        serverPort: serverPort || null,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'FiveM server configuration saved successfully!',
      server: updated,
    })
  } catch (e) {
    console.error('Save config error:', e)
    return NextResponse.json({ error: 'Failed to save configuration.' }, { status: 500 })
  }
}
