'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, Messages, getMessages, defaultLocale } from '@/lib/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: getMessages(defaultLocale),
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fivecache_locale') as Locale | null
      if (saved && (saved === 'vi' || saved === 'en')) {
        setLocaleState(saved)
        document.documentElement.lang = saved
        return
      }
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('vi')) {
        setLocaleState('vi')
        document.documentElement.lang = 'vi'
      } else {
        setLocaleState('en')
        document.documentElement.lang = 'en'
      }
    } catch {
      // fallback
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem('fivecache_locale', newLocale)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale
      }
    } catch {
      // fallback
    }
  }

  const t = getMessages(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const useTranslation = useLanguage
