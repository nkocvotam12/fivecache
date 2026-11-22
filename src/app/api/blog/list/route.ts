import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const DEMO_POSTS = [
  {
    id: '1',
    slug: 'multi-server-support',
    title: 'Manage Multiple Servers with One Account',
    category: 'New Feature',
    date: '2025-12-06T00:00:00.000Z',
    readTime: 2,
    excerpt: 'We are excited to announce a major update to FiveCache: Multi-Server Support.',
  },
  {
    id: '2',
    slug: 'optimizing-fivem-assets',
    title: 'Optimizing FiveM Assets for Performance',
    category: 'Education',
    date: '2025-11-20T00:00:00.000Z',
    readTime: 5,
    excerpt: 'Unoptimized cars, clothing, and maps are the #1 cause of texture loss, low FPS, and client crashes.',
  },
  {
    id: '3',
    slug: 'why-cdn-matters',
    title: 'Why a CDN is Critical for High-Population Servers',
    category: 'Education',
    date: '2025-11-10T00:00:00.000Z',
    readTime: 4,
    excerpt: "For high-population servers, a Content Delivery Network (CDN) isn't just a luxury; it's a necessity.",
  },
]

export async function GET() {
  try {
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
    return NextResponse.json({ posts: posts.length > 0 ? posts : DEMO_POSTS })
  } catch {
    return NextResponse.json({ posts: DEMO_POSTS })
  }
}
