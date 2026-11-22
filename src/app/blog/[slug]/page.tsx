'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Calendar, Clock, Zap, Loader2, AlertCircle } from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

type BlogPost = {
  id: string
  slug: string
  title: string
  category: string
  date: string
  readTime: number
  excerpt: string
  content: string
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog/slug?slug=${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json()
          throw new Error(data.error || 'Failed to load article')
        }
        return r.json()
      })
      .then((data) => setPost(data.post))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors text-sm mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                <p className="text-zinc-300">{error}</p>
              </div>
            ) : post ? (
              <article>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-yellow-500/10 text-xs font-medium text-yellow-300 border border-yellow-400/30">
                      {post.category}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime} min read
                    </span>
                  </div>
                </div>

                {/* Cover */}
                <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-yellow-500/20 via-zinc-800 to-zinc-900 mb-8 flex items-center justify-center">
                  <Zap className="h-16 w-16 text-yellow-400/40" />
                </div>

                {/* Content */}
                <div className="prose-dark">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>

                {/* CTA */}
                <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
                  <p className="text-zinc-400 mb-4">Ready to speed up your FiveM server?</p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-3 rounded-lg font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all"
                  >
                    Optimize Your Delivery Speed
                  </Link>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
