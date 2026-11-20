import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api'
import {
  SHIELD_PRICE_VND,
  SHIELD_DURATION_DAYS,
  SHIELD_BASE_DOMAIN,
  generateAdhesiveKey,
  generateShieldCode,
} from '@/lib/shield'

export const runtime = 'nodejs'

const CODE_PATTERN = /^[a-z0-9-]{3,20}$/

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser(req)
  if (!user) return response

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    let code = String(body.code || '').trim().toLowerCase()
    const originHost = String(body.originHost || '').trim()
    const originPort = Number(body.originPort) || 30120
    const protocol = String(body.protocol || 'http').toLowerCase() === 'https' ? 'https' : 'http'

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Server name is required.' }, { status: 400 })
    }
    if (!originHost) {
      return NextResponse.json({ error: 'Origin host is required.' }, { status: 400 })
    }
    if (!code) {
      code = generateShieldCode(name)
    }
    if (!CODE_PATTERN.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 3-20 lowercase letters, digits or hyphens.' },
        { status: 400 },
      )
    }

    // Check balance first
    if (user.balanceVnd < SHIELD_PRICE_VND) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Need ${SHIELD_PRICE_VND.toLocaleString()}đ, have ${user.balanceVnd.toLocaleString()}đ.`,
        },
        { status: 402 },
      )
    }

    // Check code uniqueness
    const existing = await db.shieldServer.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: `Code "${code}" is already taken. Choose another.` },
        { status: 409 },
      )
    }

    const adhesiveKey = generateAdhesiveKey()
    const domain = `${code}.${SHIELD_BASE_DOMAIN}`
    const cacheUrl = `https://${domain}/files`
    const expiresAt = new Date(Date.now() + SHIELD_DURATION_DAYS * 24 * 60 * 60 * 1000)

    // Transaction: create shield + deduct balance + record transaction
    const shield = await db.$transaction(async (tx) => {
      const newBalance = user.balanceVnd - SHIELD_PRICE_VND
      await tx.user.update({
        where: { id: user.id },
        data: { balanceVnd: newBalance },
      })
      const created = await tx.shieldServer.create({
        data: {
          userId: user.id,
          code,
          name,
          originHost,
          originPort,
          protocol,
          domain,
          cacheUrl,
          adhesiveKey,
          pricePerMonth: SHIELD_PRICE_VND,
          expiresAt,
          lastBilledAt: new Date(),
          status: 'active',
        },
      })
      await tx.balanceTransaction.create({
        data: {
          userId: user.id,
          amount: -SHIELD_PRICE_VND,
          type: 'shield_create',
          reference: created.id,
        },
      })
      return created
    })

    return NextResponse.json({
      ok: true,
      shield: {
        id: shield.id,
        code: shield.code,
        name: shield.name,
        domain: shield.domain,
        cacheUrl: shield.cacheUrl,
        adhesiveKey: shield.adhesiveKey,
        originHost: shield.originHost,
        originPort: shield.originPort,
        protocol: shield.protocol,
        pricePerMonth: shield.pricePerMonth,
        expiresAt: shield.expiresAt,
        status: shield.status,
      },
      configLines: {
        adhesive: `set adhesive_cdnKey "${shield.adhesiveKey}"`,
        fileserver: `fileserver_add "*" "${shield.cacheUrl}"`,
      },
    })
  } catch (e) {
    console.error('Create shield error:', e)
    return NextResponse.json({ error: 'Failed to create shield.' }, { status: 500 })
  }
}
