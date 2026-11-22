import crypto from 'crypto'
import { db } from './db'

// ===== Configuration =====
export const SHIELD_PRICE_VND = 299_000
export const SHIELD_DURATION_DAYS = 30
export const SHIELD_TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes
export const SHIELD_BASE_DOMAIN = 'fivecachesite.vercel.app'

// CitizenFX client identification
const CITIZENFX_USER_AGENT_PATTERNS = [
  /^CitizenFX/i,
  /^Cfx/i,
  /CitizenFX/i,
  /fivem/i,
]

/**
 * Generate a 32-byte hex random adhesive_cdnKey.
 * This is the value the server owner pastes into:
 *   set adhesive_cdnKey "<this value>"
 */
export function generateAdhesiveKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a short-lived bearer token for a FiveM player session.
 * Returned to the FXServer when it calls /api/shield/token, then the
 * client uses this token in the `?token=` query param when fetching files.
 */
export function generateShieldToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

/**
 * Generate a URL-safe code for the shield subdomain.
 * Lowercase alphanumeric, length 8-12.
 */
export function generateShieldCode(name: string): string {
  // Slugify the name; if empty, generate random
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12)
  if (slug.length >= 3) return slug
  return crypto.randomBytes(4).toString('hex')
}

/**
 * FiveM client-side cache obfuscation.
 *
 * FiveM natively XORs cache file content with a per-client random key,
 * OR with the global `adhesive_cdnKey` if the server sets it. We replicate
 * that behaviour on the CDN edge so that even if a player dumps the file
 * straight from our CDN, they get encrypted bytes with no key.
 *
 * Algorithm: simple XOR stream cipher with key as keystream (repeating).
 * This is intentionally weak from a crypto standpoint — its purpose is NOT
 * confidentiality against a determined attacker who has the key, but to
 * make dumped files unopenable by Lua decompilers and text editors.
 */
export function obfuscateCacheContent(content: Buffer, adhesiveKey: string): Buffer {
  const keyBuffer = Buffer.from(adhesiveKey, 'utf8')
  if (keyBuffer.length === 0) return content
  const out = Buffer.alloc(content.length)
  for (let i = 0; i < content.length; i++) {
    out[i] = content[i] ^ keyBuffer[i % keyBuffer.length]
  }
  return out
}

/**
 * Verify the reverse operation (for tests / debugging).
 */
export function deobfuscateCacheContent(content: Buffer, adhesiveKey: string): Buffer {
  return obfuscateCacheContent(content, adhesiveKey) // XOR is symmetric
}

/**
 * Detect whether the User-Agent header looks like a real CitizenFX client.
 * Dumpers, curl, wget, and browsers will fail this check.
 */
export function isCitizenFxClient(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return CITIZENFX_USER_AGENT_PATTERNS.some((p) => p.test(userAgent))
}

/**
 * Compute a stable content hash for a cache file path.
 * The FXServer calls /api/shield/token with a list of file paths it's
 * about to serve to the player, and we record their hashes. When the
 * client then requests /files/<path>?token=...&hash=..., we verify the
 * hash matches what the server registered for that token.
 *
 * We use sha256 truncated to 16 hex chars — short enough for URL use,
 * long enough that guessing is impractical.
 */
export function computeFileHash(filePath: string, adhesiveKey: string): string {
  return crypto
    .createHash('sha256')
    .update(filePath)
    .update(':')
    .update(adhesiveKey)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Issue a short-lived shield token for a player.
 * Called by the FXServer (via server-side Lua fetch) when a player joins.
 */
export async function issueShieldToken(params: {
  shieldId: string
  playerLicense: string
  playerIp: string
}): Promise<{ token: string; expiresAt: Date }> {
  const token = generateShieldToken()
  const expiresAt = new Date(Date.now() + SHIELD_TOKEN_TTL_MS)
  await db.shieldToken.create({
    data: {
      shieldId: params.shieldId,
      token,
      playerLicense: params.playerLicense,
      playerIp: params.playerIp,
      expiresAt,
    },
  })
  return { token, expiresAt }
}

/**
 * Validate a shield token presented by a FiveM client when fetching a file.
 * Returns the token record if valid, null otherwise.
 */
export async function validateShieldToken(
  token: string | undefined,
): Promise<{ shieldId: string; playerLicense: string; playerIp: string } | null> {
  if (!token) return null
  const record = await db.shieldToken.findUnique({ where: { token } })
  if (!record) return null
  if (record.expiresAt < new Date()) {
    // Expired — clean up
    await db.shieldToken.delete({ where: { id: record.id } })
    return null
  }
  return {
    shieldId: record.shieldId,
    playerLicense: record.playerLicense,
    playerIp: record.playerIp,
  }
}

/**
 * Purge all expired tokens for a shield. Called opportunistically.
 */
export async function purgeExpiredTokens(shieldId: string): Promise<number> {
  const result = await db.shieldToken.deleteMany({
    where: { shieldId, expiresAt: { lt: new Date() } },
  })
  return result.count
}

/**
 * Log every file access attempt for forensics + dashboard stats.
 */
export async function logShieldAccess(params: {
  shieldId: string
  playerIp: string | null
  playerLicense: string | null
  filePath: string
  status: 'allowed' | 'blocked'
  reason: string
  bytesServed?: number
}): Promise<void> {
  try {
    await db.shieldAccessLog.create({ data: params })
  } catch (e) {
    // Logging failure must never break file serving
    console.error('logShieldAccess failed:', e)
  }
}

/**
 * Bill the user for shield subscription.
 * Checks balance, deducts, records transaction, updates shield expiry.
 * Throws if balance insufficient.
 */
export async function billShieldSubscription(shieldId: string): Promise<{ newBalance: number }> {
  return await db.$transaction(async (tx) => {
    const shield = await tx.shieldServer.findUnique({
      where: { id: shieldId },
      include: { user: true },
    })
    if (!shield) throw new Error('Shield not found')
    if (shield.user.balanceVnd < shield.pricePerMonth) {
      throw new Error('Insufficient balance')
    }
    const newBalance = shield.user.balanceVnd - shield.pricePerMonth
    const newExpiry = new Date(Math.max(shield.expiresAt.getTime(), Date.now()) + SHIELD_DURATION_DAYS * 24 * 60 * 60 * 1000)
    await tx.user.update({
      where: { id: shield.userId },
      data: { balanceVnd: newBalance },
    })
    await tx.shieldServer.update({
      where: { id: shieldId },
      data: {
        expiresAt: newExpiry,
        lastBilledAt: new Date(),
        status: 'active',
      },
    })
    await tx.balanceTransaction.create({
      data: {
        userId: shield.userId,
        amount: -shield.pricePerMonth,
        type: 'shield_renew',
        reference: shield.id,
      },
    })
    return { newBalance }
  })
}

/**
 * Suspend shields whose subscription has expired and balance cannot cover renewal.
 * Called by cron / scheduler.
 */
export async function processExpiredShields(): Promise<{ suspended: number }> {
  const expired = await db.shieldServer.findMany({
    where: {
      status: 'active',
      expiresAt: { lt: new Date() },
    },
    include: { user: true },
  })
  let suspended = 0
  for (const shield of expired) {
    if (shield.autoRenew && shield.user.balanceVnd >= shield.pricePerMonth) {
      try {
        await billShieldSubscription(shield.id)
      } catch (e) {
        console.error(`Auto-renew failed for shield ${shield.id}:`, e)
        await db.shieldServer.update({
          where: { id: shield.id },
          data: { status: 'suspended' },
        })
        suspended++
      }
    } else {
      await db.shieldServer.update({
        where: { id: shield.id },
        data: { status: 'suspended' },
      })
      suspended++
    }
  }
  return { suspended }
}
