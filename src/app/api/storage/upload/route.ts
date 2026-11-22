import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

// Allowed extensions for FiveM caching
const ALLOWED_EXTS = ['.ytd', '.yft', '.ydr', '.ybn', '.rpf', '.meta', '.lua', '.png', '.jpg', '.jpeg', '.webp', '.zip', '.cfg', '.json']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const customKey = formData.get('key') as string | null
    const folder = (formData.get('folder') as string | null) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400, headers: CORS_HEADERS })
    }

    const filename = file.name || 'unnamed.bin'
    const ext = filename.lastIndexOf('.') !== -1 ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : ''

    // Sanitize file path/key
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = customKey || `${folder}/${Date.now()}_${sanitizedName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const contentType = file.type || (ext === '.ytd' || ext === '.yft' || ext === '.rpf' ? 'application/octet-stream' : 'application/octet-stream')

    const uploadRes = await uploadFileToR2({
      key,
      data: buffer,
      contentType,
    })

    if (!uploadRes.success) {
      return NextResponse.json({ error: uploadRes.error || 'Failed to upload to storage' }, { status: 500, headers: CORS_HEADERS })
    }

    return NextResponse.json({
      success: true,
      key: uploadRes.key,
      url: uploadRes.url,
      size: uploadRes.size,
      contentType,
      originalName: filename,
    }, { headers: CORS_HEADERS })
  } catch (err: any) {
    console.error('[Storage Upload Error]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500, headers: CORS_HEADERS })
  }
}
