'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Calendar, Clock, ArrowLeft, Zap, Loader2 } from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

type BlogPostSummary = {
  id: string
  slug: string
  title: string
  category: string
  date: string
  readTime: number
  excerpt: string
}

const FALLBACK_POSTS: BlogPostSummary[] = [
  {
    id: '1',
    slug: 'multi-server-support',
    title: 'Manage Multiple Servers with One Account',
    category: 'New Feature',
    date: '2025-12-06T00:00:00.000Z',
    readTime: 2,
    excerpt:
      'We are excited to announce a major update to FiveCache: Multi-Server Support.',
  },
  {
    id: '2',
    slug: 'optimizing-fivem-assets',
    title: 'Optimizing FiveM Assets for Performance',
    category: 'Education',
    date: '2025-11-20T00:00:00.000Z',
    readTime: 5,
    excerpt:
      'Unoptimized cars, clothing, and maps are the #1 cause of texture loss, low FPS, and client crashes.',
  },
  {
    id: '3',
    slug: 'why-cdn-matters',
    title: 'Why a CDN is Critical for High-Population Servers',
    category: 'Education',
    date: '2025-11-10T00:00:00.000Z',
    readTime: 4,
    excerpt:
      "For high-population servers, a Content Delivery Network (CDN) isn't just a luxury; it's a necessity.",
  },
]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>(FALLBACK_POSTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/list')
      .then((r) => r.json())
      .then((data) => {
        if (data.posts && data.posts.length > 0) setPosts(data.posts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mb-2">
              Blog
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Latest <span className="text-yellow-400">articles</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              News, updates, and education about FiveM caching and server performance.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} delay={i * 0.1} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function BlogCard({ post, delay }: { post: BlogPostSummary; delay: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-yellow-500/30 hover:bg-zinc-900/60 transition-all duration-500 animate-fadeInUp"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-yellow-500/20 via-zinc-800 to-zinc-900 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="h-12 w-12 text-yellow-400/30 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 rounded-full bg-zinc-950/80 backdrop-blur-sm text-xs font-medium text-yellow-300 border border-yellow-400/30">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-50 transition-colors">
          {post.title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTime} min read
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-sm text-zinc-400 group-hover:text-yellow-400 transition-colors">
            Read article
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

export { ArrowLeft }
