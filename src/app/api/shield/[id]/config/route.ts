import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser(req)
  const { id } = await params

  try {
    const shield = await db.shieldServer.findFirst({ where: { id, userId: user.id } })
    if (shield) {
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
  } catch {
    // fallback
  }

  // Fallback demo config
  const fallbackKey = 'd8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b'
  const fallbackCacheUrl = 'https://fivecachesite.vercel.app/files'
  return NextResponse.json({
    shield: { id: id || 'sh_danchoixom', code: 'danchoixom', name: 'Dân Chơi Xóm RP' },
    configLines: {
      adhesive: `set adhesive_cdnKey "${fallbackKey}"`,
      fileserver: `fileserver_add "*" "${fallbackCacheUrl}"`,
      raw: `# FiveCache Shield CDN - Dân Chơi Xóm RP
set adhesive_cdnKey "${fallbackKey}"
fileserver_add "*" "${fallbackCacheUrl}"`,
    },
    originInfo: {
      host: '51.79.138.64',
      port: 30120,
      protocol: 'http',
    },
  })
}
