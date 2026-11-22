import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const posts = await db.blogPost.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      date: true,
      readTime: true,
      excerpt: true,
    },
  })
  return NextResponse.json({ posts })
}
