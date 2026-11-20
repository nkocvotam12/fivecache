import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

// POST /api/dashboard/clear-cache?serverId=...
// Clears cache and purges CDN (demo: increments filesCached counter)
export async function POST(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  const serverId = req.nextUrl.searchParams.get('serverId')
  if (!serverId) {
    return NextResponse.json({ error: 'serverId is required.' }, { status: 400 })
  }

  const server = await db.cacheServer.findFirst({
    where: { serverId, userId: user.id },
  })
  if (!server) {
    return NextResponse.json({ error: 'Server not found.' }, { status: 404 })
  }

  // Only Pro Plus and above can clear cache
  if (server.plan !== 'pro_plus' && server.plan !== 'custom_evarose') {
    return NextResponse.json(
      { error: 'Cache clearing is available for the Pro Plus plan.' },
      { status: 403 },
    )
  }

  // Simulate clearing
  await db.cacheServer.update({
    where: { id: server.id },
    data: {
      filesCached: Math.floor(server.filesCached * 0.1),
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true, message: 'Cache cleared and CDN purged.' })
}
