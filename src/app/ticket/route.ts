import { NextRequest } from 'next/server'
import { handleGet, handlePost, handleOptions } from '@/lib/ticket-handler'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleGet(req)
}

export async function POST(req: NextRequest) {
  return handlePost(req)
}

export async function OPTIONS() {
  return handleOptions()
}
