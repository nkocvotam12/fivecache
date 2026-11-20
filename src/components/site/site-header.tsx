'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name?: string | null; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ? { name: data.user.name, email: data.user.email } : null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [pathname])

  return (
    <header className="relative z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Zap className="h-5 w-5 text-black" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">FiveCache</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300"
              href="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300"
              href="/#features"
            >
              Features
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300"
              href="/#pricing"
            >
              Pricing
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300"
              href="/#how-it-works"
            >
              How it Works
            </Link>
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-0 rounded-lg px-6 py-2 h-10 font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300"
                href="/login"
              >
                Login
              </Link>
            )}
            <Link
              href={loading || user ? '/dashboard' : '/signup'}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-0 rounded-lg px-6 py-2 h-10 font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-zinc-300 hover:text-zinc-50 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-md px-4 py-4 flex flex-col gap-3">
          <Link
            href="/blog"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/#features"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/#how-it-works"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            How it Works
          </Link>
          <Link
            href={user ? '/dashboard' : '/login'}
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            {user ? 'Dashboard' : 'Login'}
          </Link>
          <Link
            href={user ? '/dashboard' : '/signup'}
            className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black rounded-lg px-6 py-2 font-semibold"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      )}
    </header>
  )
}
