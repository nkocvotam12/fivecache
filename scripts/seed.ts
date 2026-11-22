// Seed script - run with: bun run scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const db = new PrismaClient()

const BLOG_POSTS = [
  {
    slug: 'multi-server-support',
    title: 'Manage Multiple Servers with One Account',
    category: 'New Feature',
    date: new Date('2025-12-06'),
    readTime: 2,
    excerpt:
      'We are excited to announce a major update to FiveCache: Multi-Server Support.',
    content: `We are excited to announce a major update to **FiveCache**: *Multi-Server Support*.

Many of our users manage communities with multiple FiveM server instances—whether it's a roleplay server, an arena server, or a development environment. Until now, managing the cache for each of these required separate setups or workarounds.

## What's New?

- **Unified Dashboard:** View and manage all your servers from a single dashboard.
- **Isolated Caches:** Each server gets its own isolated cache environment, ensuring no conflicts between resources.
- **Scalable Plans:** Upgrade individual servers as needed without affecting your other instances.

This update simplifies the workflow for community owners and developers, allowing you to focus on what matters most: creating great experiences for your players.

## How to get started

Simply log in to your dashboard, and you will see the new option to "Add Server". Follow the setup guide to integrate FiveCache with your additional server instances.

> Go to Dashboard to try it now.`,
  },
  {
    slug: 'optimizing-fivem-assets',
    title: 'Optimizing FiveM Assets for Performance',
    category: 'Education',
    date: new Date('2025-11-20'),
    readTime: 5,
    excerpt:
      'Unoptimized cars, clothing, and maps are the #1 cause of texture loss, low FPS, and client crashes.',
    content: `Running a high-performance FiveM server requires more than just good hardware; it requires optimized assets. Unoptimized cars, clothing, and maps are the #1 cause of texture loss (the dreaded "city bug"), low FPS, and client crashes.

In this guide, we'll cover the essential steps to ensure your custom assets are lean, mean, and ready for high player counts.

## Texture Compression (YTD)

Textures are often the heaviest part of any asset. Many car mods come with 4K or even 8K textures that are completely unnecessary for a game engine like GTA V.

- **Resize textures:** Downscale textures to 1024x1024 or 2048x2048 max for large vehicles.
- **Use DXT compression:** Ensure your .ytd files use proper DXT1/DXT5 compression.
- **Target size:** Aim for vehicle .ytd files under 10MB. Anything over 16MB can cause texture loss issues.

## Polygon Counts (YFT)

High-poly models look great in renders but can kill game performance. The game engine has to calculate lighting and physics for every single polygon.

For vehicle models, try to stick to the following guidelines:

| LOD | Polygons |
| --- | --- |
| L0 (High) | Under 200k polys |
| L1 (Med) | Under 50k polys |
| L2 (Low) | Under 5k polys |

Always ensure your models have proper LODs (Level of Detail). Without LODs, the game renders the full high-poly model even when the car is a mile away.

## Streaming & Resource Management

How you organize your resources matters just as much as the assets themselves.

### Combine Resources
Instead of having 50 individual car resources, combine them into a single pack. This reduces the server overhead of mounting resources.

### Virtual Memory
Monitor your server's physical memory usage. Oversized assets can cause "Out of Memory" crashes for players with lower-end PCs.

## Conclusion

Optimization is an ongoing process. By following these guidelines, you ensure a smoother experience for your community and reduce the number of support tickets about "texture loss" or "crashing".

Coupled with a fast CDN like FiveCache to deliver these optimized assets quickly, your server will perform better than ever.`,
  },
  {
    slug: 'why-cdn-matters',
    title: 'Why a CDN is Critical for High-Population Servers',
    category: 'Education',
    date: new Date('2025-11-10'),
    readTime: 4,
    excerpt:
      "For high-population servers, a Content Delivery Network (CDN) isn't just a luxury; it's a necessity.",
    content: `As your FiveM server grows, you might start noticing complaints about slow download speeds, "curl error" messages, or players getting timed out while joining. These aren't just minor annoyances—they are signs that your server's direct file serving capabilities are reaching their limit.

For high-population servers, a Content Delivery Network (CDN) isn't just a luxury; it's a necessity. Here's why moving your assets to a global CDN like FiveCache can transform your player experience.

## The Bandwidth Bottleneck

When you host assets directly on your game server (VPS or Dedicated), every player downloading cars, maps, and clothes is eating into the same bandwidth that the server uses to sync player positions and game state.

The result? High ping, lag spikes for existing players, and slow downloads for joining players. A CDN offloads 100% of this traffic, leaving your server's bandwidth free for what matters: the gameplay.

## Geographic Latency

If your server is hosted in Germany, a player joining from the US or Asia will experience slow download speeds due to distance. A CDN stores copies of your files in data centers all around the world.

With FiveCache, a player in New York downloads files from a New York server, while a player in London downloads from London. This can reduce download times by up to **80%**.

### Without CDN
- Server bandwidth saturated
- High ping during mass joins
- Single point of failure
- Slow global speeds

### With FiveCache CDN
- Zero load on game server
- Consistent low ping
- Global redundancy
- Maximum download speeds

## Reliability and DDoS Protection

Serving files exposes your server IP to potential attacks. By using a CDN, the file requests are handled by our protected infrastructure. Even if your game server is under attack, players can still download the cache, and once the attack is mitigated, they are ready to join immediately.`,
  },
]

const DEMO_COUNTRIES = [
  { country: 'United States', code: 'US' },
  { country: 'Germany', code: 'DE' },
  { country: 'United Kingdom', code: 'GB' },
  { country: 'Italy', code: 'IT' },
  { country: 'France', code: 'FR' },
  { country: 'Brazil', code: 'BR' },
  { country: 'Netherlands', code: 'NL' },
  { country: 'Spain', code: 'ES' },
]

const DEMO_FILES = [
  'stream/vehicles/police.ytd',
  'stream/maps/mlo_interior.ybn',
  'stream/clothes/sheriff.ydd',
  'stream/audio/sfx.awc',
  'stream/vehicles/civ_car.yft',
  'stream/weapons/pistol.ydr',
  'stream/maps/pd_interior.ytyp',
  'stream/clothes/ems_uniform.ydd',
]

function makeMonthlyStats(serverId: string) {
  const now = new Date()
  const months: Array<{
    serverId: string
    month: Date
    requests: number
    bandwidth: number
    hit2xx: number
    hit3xx: number
    hit4xx: number
    hit5xx: number
    hitRate: number
  }> = []
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const baseReq = 800000 + Math.floor(Math.random() * 600000)
    const bandwidth = baseReq * (1024 * 8)
    const hit2xx = Math.floor(baseReq * (0.86 + Math.random() * 0.06))
    const hit3xx = Math.floor(baseReq * 0.05)
    const hit4xx = Math.floor(baseReq * 0.03)
    const hit5xx = Math.floor(baseReq * 0.01)
    const hitRate = 0.78 + Math.random() * 0.12
    months.push({
      serverId,
      month,
      requests: baseReq,
      bandwidth,
      hit2xx,
      hit3xx,
      hit4xx,
      hit5xx,
      hitRate,
    })
  }
  return months
}

async function main() {
  console.log('Seeding FiveCache database...')

  await db.balanceTransaction.deleteMany()
  await db.shieldAccessLog.deleteMany()
  await db.shieldToken.deleteMany()
  await db.shieldServer.deleteMany()
  await db.topFile.deleteMany()
  await db.topCountry.deleteMany()
  await db.monthlyStat.deleteMany()
  await db.cacheServer.deleteMany()
  await db.verificationToken.deleteMany()
  await db.session.deleteMany()
  await db.user.deleteMany()
  await db.blogPost.deleteMany()

  const demoUser = await db.user.create({
    data: {
      email: 'demo@fivecache.site',
      name: 'Demo User',
      passwordHash: hashPassword('demo1234'),
      emailVerified: new Date(),
      plan: 'pro_plus',
      balanceVnd: 10_000_000, // give demo user enough balance for testing shields
    },
  })
  console.log(`Created demo user: ${demoUser.email} (balance: ${demoUser.balanceVnd.toLocaleString()}đ)`)

  const serverId = 'demo1abc2'
  const domain = `${serverId}.fivecache.site`
  const cacheUrl = `https://${domain}/files`
  const cacheServer = await db.cacheServer.create({
    data: {
      userId: demoUser.id,
      serverId,
      name: 'My Roleplay Server',
      serverIp: '149.202.65.1',
      serverPort: 30120,
      domain,
      cacheUrl,
      plan: 'pro_plus',
      blocked: false,
      totalRequests: 1284562,
      bandwidthUsed: 1284562 * 1024 * 12,
      storageUsed: 6_442_450_944,
      cacheHitRate: 0.94,
      filesCached: 1847,
      status2xx: 1108923,
      status3xx: 64228,
      status4xx: 38536,
      status5xx: 12875,
    },
  })

  // Demo shield server
  const shieldCode = 'sharkcity'
  const shieldDomain = `${shieldCode}.fivecache.shield`
  const shieldCacheUrl = `https://${shieldDomain}/files`
  const shieldAdhesiveKey = 'demo1234adhesivekeyfivemshield1234567890abcdef'
  const shield = await db.shieldServer.create({
    data: {
      userId: demoUser.id,
      code: shieldCode,
      name: 'SharkCITY',
      originHost: '149.202.65.1',
      originPort: 30120,
      protocol: 'http',
      domain: shieldDomain,
      cacheUrl: shieldCacheUrl,
      adhesiveKey: shieldAdhesiveKey,
      status: 'active',
      pricePerMonth: 299_000,
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days left
      lastBilledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      totalRequests: 458_921,
      blockedRequests: 12_847,
      bandwidthServed: 458_921 * 1024 * 4,
      uniquePlayers: 3_842,
    },
  })
  await db.balanceTransaction.create({
    data: {
      userId: demoUser.id,
      amount: -299_000,
      type: 'shield_create',
      reference: shield.id,
    },
  })
  console.log(`Created demo shield: ${shield.code} (key: ${shield.adhesiveKey.slice(0, 8)}...)`)

  // Seed some sample shield access logs
  const sampleLogs = [
    { filePath: 'stream/vehicles/police.ytd', status: 'allowed', reason: 'ok', bytesServed: 1024 * 50, playerIp: '14.231.45.1', playerLicense: 'abc123def456' },
    { filePath: 'scripts/client.lua', status: 'blocked', reason: 'bad_user_agent', bytesServed: 0, playerIp: '45.155.205.83', playerLicense: null },
    { filePath: 'scripts/server.js', status: 'blocked', reason: 'no_token', bytesServed: 0, playerIp: '89.248.165.12', playerLicense: null },
    { filePath: 'stream/vehicles/civ_car.yft', status: 'allowed', reason: 'ok', bytesServed: 1024 * 120, playerIp: '14.231.45.1', playerLicense: 'abc123def456' },
    { filePath: 'scripts/client.lua', status: 'blocked', reason: 'invalid_hash', bytesServed: 0, playerIp: '203.0.113.45', playerLicense: 'faker' },
  ]
  await db.shieldAccessLog.createMany({
    data: sampleLogs.map((l) => ({ ...l, shieldId: shield.id })),
  })

  const monthly = makeMonthlyStats(cacheServer.id)
  await db.monthlyStat.createMany({ data: monthly })

  const totalReqs = cacheServer.totalRequests
  const countries = DEMO_COUNTRIES.map((c, i) => ({
    serverId: cacheServer.id,
    country: c.country,
    code: c.code,
    requests: Math.floor((totalReqs * (0.30 - i * 0.04)) * (0.7 + Math.random() * 0.3)),
  })).filter((c) => c.requests > 0)
  await db.topCountry.createMany({ data: countries })

  const files = DEMO_FILES.map((f) => ({
    serverId: cacheServer.id,
    file: f,
    requests: Math.floor(80000 + Math.random() * 200000),
  }))
  await db.topFile.createMany({ data: files })

  console.log(`Created cache server: ${cacheServer.name}`)

  for (const post of BLOG_POSTS) {
    await db.blogPost.create({ data: post })
  }
  console.log(`Created ${BLOG_POSTS.length} blog posts`)

  console.log('Seed complete.')
  console.log('Login with: demo@fivecache.site / demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
