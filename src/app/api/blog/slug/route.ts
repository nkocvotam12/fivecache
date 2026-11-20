import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug is required.' }, { status: 400 })
  }
  const post = await db.blogPost.findUnique({ where: { slug } })
  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }
  return NextResponse.json({ post })
}
