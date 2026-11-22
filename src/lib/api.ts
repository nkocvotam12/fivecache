import { NextRequest, NextResponse } from 'next/server'

export const MOCK_USER = {
  id: 'usr_demo_admin',
  email: 'admin@fivecachesite.vercel.app',
  name: 'FiveCache Admin',
  plan: 'pro_plus',
  emailVerified: true,
  balanceVnd: 500000,
}

export async function requireUser(_req?: NextRequest) {
  // Authentication completely bypassed: always return admin demo user
  return { user: MOCK_USER, response: null }
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
