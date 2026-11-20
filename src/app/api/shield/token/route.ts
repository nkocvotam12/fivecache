import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { issueShieldToken, purgeExpiredTokens, SHIELD_TOKEN_TTL_MS } from '@/lib/shield'

export const runtime = 'nodejs'

/**
 * POST /api/shield/token
 *
 * Called by the FiveM FXServer (server-side Lua `PerformHttpRequest` or
 * Node.js native) when a player connects. The server passes:
 *   - code: the shield code (subdomain)
 *   - playerLicense: the player's FiveM license identifier
 *   - playerIp: the player's public IP as seen by the server
 *   - sharedSecret: the shield's adhesiveKey (authenticates the FXServer)
 *
 * Returns a short-lived bearer token the client will use in `?token=`
 * when fetching cache files. The token is bound to:
 *   - the player's IP (so a dumper on a different IP cannot reuse it)
 *   - the player's license (so two different players cannot share it)
 *   - a 5-minute TTL (so it dies shortly after disconnect)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body.code || '').trim().toLowerCase()
    const playerLicense = String(body.playerLicense || '').trim()
    const playerIp = String(body.playerIp || '').trim()
    const sharedSecret = String(body.sharedSecret || '')

    if (!code || !playerLicense || !playerIp || !sharedSecret) {
      return NextResponse.json(
        { error: 'code, playerLicense, playerIp and sharedSecret are required.' },
        { status: 400 },
      )
    }

    // Validate sharedSecret == adhesiveKey. This proves the caller is the
    // real FXServer that owns this shield (the adhesiveKey is only ever
    // visible in the server.cfg of the real FXServer).
    const shield = await db.shieldServer.findUnique({ where: { code } })
    if (!shield) {
      return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
    }
    if (shield.status !== 'active') {
      return NextResponse.json(
        { error: `Shield is ${shield.status}.` },
        { status: 403 },
      )
    }
    if (shield.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Shield subscription expired.' }, { status: 403 })
    }
    // Constant-time-ish comparison
    if (shield.adhesiveKey.length !== sharedSecret.length ||
        shield.adhesiveKey !== sharedSecret) {
      return NextResponse.json({ error: 'Invalid shared secret.' }, { status: 401 })
    }

    // Opportunistic cleanup
    await purgeExpiredTokens(shield.id)

    const { token, expiresAt } = await issueShieldToken({
      shieldId: shield.id,
      playerLicense,
      playerIp,
    })

    return NextResponse.json({
      ok: true,
      token,
      expiresAt,
      ttlMs: SHIELD_TOKEN_TTL_MS,
      cacheUrl: shield.cacheUrl,
    })
  } catch (e) {
    console.error('Issue shield token error:', e)
    return NextResponse.json({ error: 'Failed to issue token.' }, { status: 500 })
  }
}
