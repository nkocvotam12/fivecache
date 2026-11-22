import { NextRequest, NextResponse } from 'next/server'
import { getSession, parseSessionCookie } from './auth'

export async function requireUser(req: NextRequest) {
  const token = parseSessionCookie(req)
  const session = await getSession(token)
  if (!session) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Please log in again.' }, { status: 401 }),
    }
  }
  return { user: session.user, response: null }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i < 2 ? 0 : 1)} ${sizes[i]}`
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
