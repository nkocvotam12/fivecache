import { NextRequest, NextResponse } from 'next/server'
import { getFileFromR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const filePath = (resolvedParams.path || []).join('/')

  if (!filePath) {
    return NextResponse.json({ error: 'File path required' }, { status: 400, headers: CORS_HEADERS })
  }

  const file = await getFileFromR2(filePath)

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404, headers: CORS_HEADERS })
  }

  // Edge Caching headers optimized for FiveM game assets
  const headers = new Headers({
    ...CORS_HEADERS,
    'Content-Type': file.contentType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Cache-Status': 'HIT',
    'X-FiveCache-CDN': 'Active',
    'Content-Length': String(file.buffer.length),
  })

  return new NextResponse(new Uint8Array(file.buffer), {
    status: 200,
    headers,
  })
}
