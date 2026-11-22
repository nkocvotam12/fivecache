/**
 * Cloudflare D1 Database REST Client
 * Zero-dependency Cloudflare D1 adapter using Cloudflare v4 REST API.
 */

export interface D1Config {
  accountId: string
  databaseId: string
  apiToken: string
}

export function getD1Config(): D1Config {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID || '',
    apiToken: process.env.CLOUDFLARE_D1_API_TOKEN || '',
  }
}

export function isD1Configured(): boolean {
  const cfg = getD1Config()
  return Boolean(cfg.accountId && cfg.databaseId && cfg.apiToken)
}

export interface D1QueryResult<T = any> {
  results: T[]
  success: boolean
  meta?: {
    duration?: number
    changes?: number
    last_row_id?: number
    served_by?: string
  }
  error?: string
}

/**
 * Execute a single query on Cloudflare D1 with parameters
 */
export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<D1QueryResult<T>> {
  const config = getD1Config()

  if (!isD1Configured()) {
    console.log('[D1 Mock Query]', sql, params)
    return {
      results: [] as T[],
      success: true,
      meta: { changes: 0, duration: 0.1 },
    }
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      const errMsg = data.errors?.[0]?.message || `D1 HTTP error ${res.status}`
      console.error('[D1 Error]', errMsg)
      return { results: [], success: false, error: errMsg }
    }

    const firstResult = data.result?.[0]
    return {
      results: (firstResult?.results || []) as T[],
      success: true,
      meta: firstResult?.meta,
    }
  } catch (err: any) {
    console.error('[D1 Exception]', err)
    return { results: [], success: false, error: err.message || 'Unknown network error querying D1' }
  }
}

/**
 * Execute raw batch/DDL commands in D1
 */
export async function execD1(sql: string): Promise<{ success: boolean; error?: string }> {
  const result = await queryD1(sql)
  return { success: result.success, error: result.error }
}
