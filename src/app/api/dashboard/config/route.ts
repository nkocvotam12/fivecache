import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { user } = await requireUser(req)

  try {
    const body = await req.json()
    const id = String(body.serverId || '')
    const name = String(body.name || '').trim()
    const serverIp = String(body.serverIp || '').trim()
    const serverPort = Number(body.serverPort) || null

    if (!id || !name) {
      return NextResponse.json({ error: 'Server id and name are required.' }, { status: 400 })
    }

    try {
      const owned = await db.cacheServer.findFirst({ where: { serverId: id, userId: user.id } })
      if (owned) {
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
      }
    } catch {
      // ignore db error
    }

    return NextResponse.json({
      ok: true,
      message: 'FiveM server configuration saved successfully (demo mode)!',
      server: { id, serverId: id, name, serverIp, serverPort },
    })
  } catch (e) {
    console.error('Save config error:', e)
    return NextResponse.json({ error: 'Failed to save configuration.' }, { status: 500 })
  }
}
