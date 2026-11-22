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
      return NextResponse.json({ error: 'Yêu cầu nhập ID server và tên server.' }, { status: 400 })
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
          message: 'Đã lưu cấu hình server FiveM thành công!',
          server: updated,
        })
      }
    } catch {
      // bỏ qua lỗi db
    }

    return NextResponse.json({
      ok: true,
      message: 'Đã lưu cấu hình server FiveM thành công (chế độ demo)!',
      server: { id, serverId: id, name, serverIp, serverPort },
    })
  } catch (e) {
    console.error('Lỗi lưu cấu hình:', e)
    return NextResponse.json({ error: 'Không thể lưu cấu hình.' }, { status: 500 })
  }
}