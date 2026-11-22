/**
 * Cloudflare R2 Object Storage Integration
 * Zero-dependency S3-compatible client with AWS SigV4 signature using native Node crypto.
 */

import crypto from 'crypto'

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicDomain?: string
}

export function getR2Config(): R2Config {
  return {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'fivecache-assets',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || 'https://pub-r2.fivecache.site',
  }
}

export function isR2Configured(): boolean {
  const cfg = getR2Config()
  return Boolean(cfg.accountId && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucketName)
}

// In-memory fallback storage for serverless environments when R2 credentials are not set
const globalForR2 = globalThis as unknown as {
  r2FallbackStore?: Map<string, { buffer: Buffer; contentType: string; size: number; updatedAt: Date }>
}

if (!globalForR2.r2FallbackStore) {
  globalForR2.r2FallbackStore = new Map()
}
const fallbackStore = globalForR2.r2FallbackStore!

/**
 * AWS Signature Version 4 Helpers
 */
function hmac(key: Buffer | string, string: string): Buffer {
  return crypto.createHmac('sha256', key).update(string).digest()
}

function sha256(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmac('AWS4' + key, dateStamp)
  const kRegion = hmac(kDate, regionName)
  const kService = hmac(kRegion, serviceName)
  const kSigning = hmac(kService, 'aws4_request')
  return kSigning
}

/**
 * Upload a file/asset to Cloudflare R2
 */
export async function uploadFileToR2(params: {
  key: string
  data: Buffer
  contentType?: string
}): Promise<{ success: boolean; url: string; key: string; size: number; error?: string }> {
  const { key, data } = params
  const contentType = params.contentType || 'application/octet-stream'
  const size = data.length

  const config = getR2Config()

  if (!isR2Configured()) {
    console.log(`[R2 Fallback] Storing ${key} (${size} bytes) in memory cache`)
    fallbackStore.set(key, { buffer: data, contentType, size, updatedAt: new Date() })
    const url = `/api/storage/files/${key}`
    return {
      success: true,
      url,
      key,
      size,
    }
  }

  try {
    const region = 'auto'
    const service = 's3'
    const host = `${config.accountId}.r2.cloudflarestorage.com`
    const endpoint = `https://${host}/${config.bucketName}/${encodeURI(key)}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substring(0, 8)

    const payloadHash = sha256(data)

    const canonicalUri = `/${config.bucketName}/${encodeURI(key)}`
    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

    const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service)
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        Host: host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: authHeader,
      },
      body: new Uint8Array(data),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[R2 Upload Error]', res.status, errText)
      return { success: false, url: '', key, size, error: `R2 returned HTTP ${res.status}: ${errText}` }
    }

    const publicUrl = config.publicDomain ? `${config.publicDomain.replace(/\/$/, '')}/${key}` : `/api/storage/files/${key}`

    return {
      success: true,
      url: publicUrl,
      key,
      size,
    }
  } catch (err: any) {
    console.error('[R2 Upload Exception]', err)
    return { success: false, url: '', key, size, error: err.message || 'Unknown R2 upload exception' }
  }
}

/**
 * Get file from R2 or fallback store
 */
export async function getFileFromR2(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (fallbackStore.has(key)) {
    const item = fallbackStore.get(key)!
    return { buffer: item.buffer, contentType: item.contentType }
  }

  const config = getR2Config()
  if (!isR2Configured()) {
    return null
  }

  try {
    const region = 'auto'
    const service = 's3'
    const host = `${config.accountId}.r2.cloudflarestorage.com`
    const endpoint = `https://${host}/${config.bucketName}/${encodeURI(key)}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substring(0, 8)

    const payloadHash = sha256('')
    const canonicalUri = `/${config.bucketName}/${encodeURI(key)}`
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

    const canonicalRequest = `GET\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service)
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Host: host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: authHeader,
      },
    })

    if (!res.ok) return null

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    return { buffer, contentType }
  } catch (err) {
    console.error('[R2 Fetch Exception]', err)
    return null
  }
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFileFromR2(key: string): Promise<boolean> {
  if (fallbackStore.has(key)) {
    fallbackStore.delete(key)
    return true
  }

  const config = getR2Config()
  if (!isR2Configured()) return true

  try {
    const region = 'auto'
    const service = 's3'
    const host = `${config.accountId}.r2.cloudflarestorage.com`
    const endpoint = `https://${host}/${config.bucketName}/${encodeURI(key)}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substring(0, 8)

    const payloadHash = sha256('')
    const canonicalUri = `/${config.bucketName}/${encodeURI(key)}`
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

    const canonicalRequest = `DELETE\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service)
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Host: host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: authHeader,
      },
    })

    return res.ok
  } catch (err) {
    console.error('[R2 Delete Exception]', err)
    return false
  }
}
