'use client'

import Link from 'next/link'
import { Zap, MessageCircle, FileText } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { LanguageSwitcher } from '@/components/site/language-switcher'

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" fill="currentColor" />
              </div>
              <span className="text-lg font-bold">FiveCache</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              {t.footer.tagline}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-zinc-50 mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/blog" className="hover:text-yellow-400 transition-colors">
                  {t.nav.blog}
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-yellow-400 transition-colors">
                  {t.nav.features}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-yellow-400 transition-colors">
                  {t.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-yellow-400 transition-colors">
                  {t.nav.howItWorks}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-zinc-50 mb-4">{t.footer.support}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a
                  href="#"
                  className="hover:text-yellow-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> {t.footer.discord}
                </a>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="hover:text-yellow-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="hover:text-yellow-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} FiveCache. {t.footer.rights}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Ngôn ngữ:</span>
            <LanguageSwitcher variant="pill" />
          </div>
        </div>
      </div>
    </footer>
  )
}
