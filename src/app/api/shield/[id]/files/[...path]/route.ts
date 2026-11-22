import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  isCitizenFxClient,
  validateShieldToken,
  computeFileHash,
  obfuscateCacheContent,
  logShieldAccess,
} from '@/lib/shield'
import { formatBytes } from '@/lib/api'

export const runtime = 'nodejs'

/**
 * GET /api/shield/[code]/files/[...path]?token=...&hash=...
 *
 * The actual CDN file server endpoint that FiveM clients hit when fetching
 * cache files. Implements 4-layer anti-dump:
 *
 * 1. User-Agent check — must look like CitizenFX (blocks curl, wget, browsers)
 * 2. Shield status check — must be active and not expired
 * 3. Token validation — token must exist, not be expired, and match a player
 *    the FXServer has accepted
 * 4. Content hash check — the hash in the query must match what the server
 *    would issue for this file (proves the request comes through the real
 *    FiveM client pipeline, not a replay)
 *
 * If all checks pass: fetch file from origin FXServer, obfuscate with the
 * shield's adhesive_cdnKey (XOR stream), serve to client, log access.
 *
 * In production the origin fetch would be an HTTP request to the FXServer's
 * own /files endpoint. For demo we read from /public/mock-origin/.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> },
) {
  // The `id` param in the URL is actually the shield code (subdomain).
  // We accept either the code or the cuid id for lookup flexibility.
  const { id: code, path } = await params
  const filePath = path.join('/')
  const token = req.nextUrl.searchParams.get('token') || undefined
  const hash = req.nextUrl.searchParams.get('hash') || ''
  const userAgent = req.headers.get('user-agent')
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'

  // Look up shield
  const shield = await db.shieldServer.findUnique({ where: { code } })

  // Common logging payload
  const logPayload = {
    shieldId: shield?.id ?? 'unknown',
    playerIp: clientIp,
    playerLicense: null as string | null,
    filePath,
    status: 'blocked' as 'allowed' | 'blocked',
    reason: '',
    bytesServed: 0,
  }

  // ===== Layer 1: shield must exist & be active =====
  if (!shield) {
    logPayload.reason = 'shield_inactive'
    await logShieldAccess(logPayload)
    return NextResponse.json({ error: 'Shield not found.' }, { status: 404 })
  }
  if (shield.status !== 'active') {
    logPayload.reason = 'shield_inactive'
    await logShieldAccess(logPayload)
    return NextResponse.json({ error: `Shield is ${shield.status}.` }, { status: 403 })
  }
  if (shield.expiresAt < new Date()) {
    logPayload.reason = 'shield_inactive'
    await logShieldAccess(logPayload)
    return NextResponse.json({ error: 'Shield subscription expired.' }, { status: 403 })
  }

  // ===== Layer 2: User-Agent must look like CitizenFX =====
  if (!isCitizenFxClient(userAgent)) {
    logPayload.reason = 'bad_user_agent'
    await logShieldAccess(logPayload)
    // Increment blocked counter
    await db.shieldServer.update({
      where: { id: shield.id },
      data: { blockedRequests: { increment: 1 }, totalRequests: { increment: 1 } },
    })
    return NextResponse.json(
      { error: 'Bad User-Agent. Only FiveM clients can fetch cache files.' },
      { status: 403 },
    )
  }

  // ===== Layer 3: token must be valid =====
  const tokenInfo = await validateShieldToken(token)
  if (!tokenInfo) {
    logPayload.reason = token ? 'invalid_token' : 'no_token'
    await logShieldAccess(logPayload)
    await db.shieldServer.update({
      where: { id: shield.id },
      data: { blockedRequests: { increment: 1 }, totalRequests: { increment: 1 } },
    })
    return NextResponse.json(
      { error: 'Missing or invalid token. The FXServer must call /api/shield/token first.' },
      { status: 401 },
    )
  }
  if (tokenInfo.shieldId !== shield.id) {
    logPayload.reason = 'invalid_token'
    logPayload.playerLicense = tokenInfo.playerLicense
    await logShieldAccess(logPayload)
    await db.shieldServer.update({
      where: { id: shield.id },
      data: { blockedRequests: { increment: 1 }, totalRequests: { increment: 1 } },
    })
    return NextResponse.json({ error: 'Token does not match this shield.' }, { status: 403 })
  }
  logPayload.playerLicense = tokenInfo.playerLicense

  // ===== Layer 4: content hash must match =====
  const expectedHash = computeFileHash(filePath, shield.adhesiveKey)
  if (hash !== expectedHash) {
    logPayload.reason = 'invalid_hash'
    await logShieldAccess(logPayload)
    await db.shieldServer.update({
      where: { id: shield.id },
      data: { blockedRequests: { increment: 1 }, totalRequests: { increment: 1 } },
    })
    return NextResponse.json(
      { error: 'Invalid content hash. The FXServer must include the file hash when issuing the token.' },
      { status: 403 },
    )
  }

  // ===== All checks passed — fetch origin file =====
  // In production: fetch(`${shield.protocol}://${shield.originHost}:${shield.originPort}/files/${filePath}`)
  // For demo: read from /public/mock-origin/<filePath>
  let originBuffer: Buffer
  try {
    // Use Node fs via dynamic import (edge-incompatible, but we're on nodejs runtime)
    const fs = await import('node:fs/promises')
    const pathMod = await import('node:path')
    const filePathOnDisk = pathMod.join(process.cwd(), 'public', 'mock-origin', ...path)
    // Prevent path traversal
    const normalized = pathMod.normalize(filePathOnDisk)
    if (!normalized.startsWith(pathMod.join(process.cwd(), 'public', 'mock-origin'))) {
      logPayload.reason = 'invalid_path'
      await logShieldAccess(logPayload)
      return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 })
    }
    originBuffer = await fs.readFile(normalized)
  } catch {
    logPayload.reason = 'origin_fetch_failed'
    await logShieldAccess(logPayload)
    return NextResponse.json({ error: 'File not found on origin.' }, { status: 404 })
  }

  // ===== Obfuscate with adhesive_cdnKey =====
  // This is what makes the dumped file unopenable: the bytes returned to the
  // client are XOR-encrypted with the shield's adhesiveKey, which only lives
  // in (a) the FXServer's server.cfg and (b) the CitizenFX process memory
  // while running. A dumper that copies the file out of the cache folder
  // gets encrypted bytes with no key.
  const obfuscated = obfuscateCacheContent(originBuffer, shield.adhesiveKey)

  // Update stats
  logPayload.status = 'allowed'
  logPayload.reason = 'ok'
  logPayload.bytesServed = obfuscated.length
  await logShieldAccess(logPayload)
  await db.shieldServer.update({
    where: { id: shield.id },
    data: {
      totalRequests: { increment: 1 },
      bandwidthServed: { increment: obfuscated.length },
    },
  })

  // Return the obfuscated bytes as binary
  return new NextResponse(new Uint8Array(obfuscated), {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': obfuscated.length.toString(),
      'Cache-Control': 'public, max-age=300, immutable',
      'X-Shield-Code': shield.code,
      'X-Obfuscated': 'true',
      'X-Served-Bytes': obfuscated.length.toString(),
      'X-Served-Formatted': formatBytes(obfuscated.length),
    },
  })
}
