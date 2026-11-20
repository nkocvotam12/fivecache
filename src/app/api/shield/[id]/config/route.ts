import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// GET /api/shield/[id]/config
// Returns the 2 lines the server owner pastes into server.cfg.
// This is also surfaced in the shield detail page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const { id } = await params
  const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
  if (!shield) {
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }

  return NextResponse.json({
    shield: { id: shield.id, code: shield.code, name: shield.name },
    configLines: {
      adhesive: `set adhesive_cdnKey "${shield.adhesiveKey}"`,
      fileserver: `fileserver_add "*" "${shield.cacheUrl}"`,
      raw: `# FiveCache Shield CDN - add these 2 lines to server.cfg
set adhesive_cdnKey "${shield.adhesiveKey}"
fileserver_add "*" "${shield.cacheUrl}"`,
    },
    originInfo: {
      host: shield.originHost,
      port: shield.originPort,
      protocol: shield.protocol,
    },
  })
}
