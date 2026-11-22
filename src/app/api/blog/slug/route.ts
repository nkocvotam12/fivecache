import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const STATIC_POSTS: Record<string, {
  slug: string
  title: string
  category: string
  date: string
  readTime: number
  excerpt: string
  content: string
}> = {
  'multi-server-support': {
    slug: 'multi-server-support',
    title: 'Manage Multiple Servers with One Account',
    category: 'New Feature',
    date: '2025-12-06T00:00:00.000Z',
    readTime: 2,
    excerpt: 'We are excited to announce a major update to FiveCache: Multi-Server Support.',
    content: `We are excited to announce a major update to **FiveCache**: *Multi-Server Support*.

Many of our users manage communities with multiple FiveM server instances. Until now, managing the cache for each of these required separate setups or workarounds.

## What's New?
- **Unified Dashboard:** View and manage all your servers from a single dashboard.
- **Isolated Caches:** Each server gets its own isolated cache environment.
- **Scalable Plans:** Upgrade individual servers as needed.`,
  },
  'optimizing-fivem-assets': {
    slug: 'optimizing-fivem-assets',
    title: 'Optimizing FiveM Assets for Performance',
    category: 'Education',
    date: '2025-11-20T00:00:00.000Z',
    readTime: 5,
    excerpt: 'Unoptimized cars, clothing, and maps are the #1 cause of texture loss, low FPS, and client crashes.',
    content: `Running a high-performance FiveM server requires optimized assets.

## Texture Compression (YTD)
- Downscale textures to 1024x1024 or 2048x2048 max.
- Use proper DXT1/DXT5 compression.
- Aim for vehicle .ytd files under 10MB.`,
  },
  'why-cdn-matters': {
    slug: 'why-cdn-matters',
    title: 'Why a CDN is Critical for High-Population Servers',
    category: 'Education',
    date: '2025-11-10T00:00:00.000Z',
    readTime: 4,
    excerpt: "For high-population servers, a Content Delivery Network (CDN) isn't just a luxury; it's a necessity.",
    content: `When you host assets directly on your game server, every player downloading resources eats into game tick rate and network state.

A CDN offloads 100% of this traffic, leaving your server bandwidth free.`,
  },
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug is required.' }, { status: 400 })
  }

  try {
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (post) return NextResponse.json({ post })
  } catch {
    // fallback
  }

  const staticPost = STATIC_POSTS[slug]
  if (staticPost) {
    return NextResponse.json({ post: staticPost })
  }

  return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
}
