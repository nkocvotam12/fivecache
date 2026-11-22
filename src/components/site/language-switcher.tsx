'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { Locale } from '@/lib/i18n'

interface LanguageOption {
  code: Locale
  label: string
  flag: string
  shortLabel: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', shortLabel: 'VI' },
  { code: 'en', label: 'English', flag: '🇬🇧', shortLabel: 'EN' },
]

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'pill'
  className?: string
}

export function LanguageSwitcher({ variant = 'header', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0]
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center rounded-lg bg-zinc-900/80 p-1 border border-zinc-800 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              locale === lang.code
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.shortLabel}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:border-yellow-500/50 hover:bg-zinc-800/80 hover:text-yellow-400 transition-all focus:outline-none"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-yellow-400" />
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="font-semibold uppercase tracking-wider">{currentLang.shortLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 text-zinc-400 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/60 mb-1">
            Chọn ngôn ngữ / Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-yellow-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
