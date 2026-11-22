'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Zap, Shield } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { LanguageSwitcher } from '@/components/site/language-switcher'

export function SiteHeader() {
  const pathname = usePathname()
  const { t } = useLanguage()
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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
              href="/blog"
            >
              {t.nav.blog}
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
              href="/#features"
            >
              {t.nav.features}
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
              href="/#pricing"
            >
              {t.nav.pricing}
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
              href="/#how-it-works"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              className="text-zinc-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium inline-flex items-center gap-1"
              href="/shield"
            >
              <Shield className="h-3.5 w-3.5" />
              {t.nav.shieldCdn}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-0 rounded-lg px-5 py-2 h-9 font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
            >
              {t.nav.dashboard}
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              className="text-zinc-300 hover:text-zinc-50 transition-colors p-1.5"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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
            {t.nav.blog}
          </Link>
          <Link
            href="/#features"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            {t.nav.features}
          </Link>
          <Link
            href="/#pricing"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            {t.nav.pricing}
          </Link>
          <Link
            href="/#how-it-works"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            {t.nav.howItWorks}
          </Link>
          <Link
            href="/shield"
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-2 inline-flex items-center gap-1"
            onClick={() => setOpen(false)}
          >
            <Shield className="h-3.5 w-3.5" />
            {t.nav.shieldCdn}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black rounded-lg px-6 py-2.5 font-semibold text-center"
            onClick={() => setOpen(false)}
          >
            {t.nav.dashboard}
          </Link>
        </nav>
      )}
    </header>
  )
}
