'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect to dashboard if user is already authenticated.
 * Useful for /login and /signup pages.
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter()
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          router.replace('/dashboard')
        }
      })
      .catch(() => {})
  }, [router])
}
