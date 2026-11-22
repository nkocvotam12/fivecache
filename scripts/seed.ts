// Script Seed dữ liệu - chạy bằng lệnh: bun run scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const db = new PrismaClient()

const BLOG_POSTS = [
  {
    slug: 'multi-server-support',
    title: 'Quản lý Nhiều Server với Một Tài khoản',
    category: 'Tính năng mới',
    date: new Date('2025-12-06'),
    readTime: 2,
    excerpt:
      'Chúng tôi vui mừng thông báo bản cập nhật lớn cho FiveCache: Hỗ trợ Đa Server.',
    content: `Chúng tôi vui mừng thông báo bản cập nhật lớn cho **FiveCache**: *Hỗ trợ Đa Server*.

Nhiều người dùng của chúng tôi quản lý cộng đồng với nhiều phiên bản server FiveM khác nhau—dù đó là server roleplay, server đấu trường hay môi trường phát triển. Cho đến nay, việc quản lý cache cho từng server này đòi hỏi phải thiết lập riêng biệt hoặc dùng các giải pháp tạm thời.

## Có gì mới?

- **Bảng điều khiển hợp nhất:** Xem và quản lý tất cả các server của bạn từ một bảng điều khiển duy nhất.
- **Cache biệt lập:** Mỗi server có một môi trường cache riêng biệt, đảm bảo không xảy ra xung đột giữa các tài nguyên.
- **Gói dịch vụ linh hoạt:** Nâng cấp từng server khi cần mà không ảnh hưởng đến các phiên bản khác.

Bản cập nhật này đơn giản hóa quy trình làm việc cho các chủ sở hữu cộng đồng và nhà phát triển, cho phép bạn tập trung vào điều quan trọng nhất: tạo ra trải nghiệm tuyệt vời cho người chơi.

## Cách bắt đầu

Chỉ cần đăng nhập vào bảng điều khiển của bạn, và bạn sẽ thấy tùy chọn mới "Thêm Server". Làm theo hướng dẫn thiết lập để tích hợp FiveCache với các phiên bản server bổ sung của bạn.

> Truy cập Bảng điều khiển để dùng thử ngay.`,
  },
  {
    slug: 'optimizing-fivem-assets',
    title: 'Tối ưu hóa Tài nguyên FiveM để Tăng hiệu năng',
    category: 'Giáo dục',
    date: new Date('2025-11-20'),
    readTime: 5,
    excerpt:
      'Xe, quần áo và bản đồ chưa được tối ưu là nguyên nhân số 1 gây mất texture, FPS thấp và crash client.',
    content: `Vận hành một server FiveM hiệu năng cao không chỉ cần phần cứng tốt; mà còn cần tài nguyên được tối ưu. Xe, quần áo và bản đồ chưa được tối ưu là nguyên nhân số 1 gây mất texture (lỗi "city bug" đáng sợ), FPS thấp và crash client.

Trong hướng dẫn này, chúng ta sẽ đi qua các bước thiết yếu để đảm bảo tài nguyên tùy chỉnh của bạn gọn nhẹ, mạnh mẽ và sẵn sàng cho số lượng người chơi cao.

## Nén Texture (YTD)

Texture thường là phần nặng nhất của bất kỳ tài nguyên nào. Nhiều mod xe đi kèm texture 4K hoặc thậm chí 8K hoàn toàn không cần thiết cho một game engine như GTA V.

- **Thay đổi kích thước texture:** Giảm kích thước texture xuống tối đa 1024x1024 hoặc 2048x2048 cho các phương tiện lớn.
- **Sử dụng nén DXT:** Đảm bảo các file .ytd của bạn sử dụng nén DXT1/DXT5 phù hợp.
- **Kích thước mục tiêu:** Hướng đến các file .ytd của xe dưới 10MB. Bất kỳ file nào trên 16MB đều có thể gây ra vấn đề mất texture.

## Số lượng Đa giác (YFT)

Các mô hình đa giác cao trông tuyệt vời khi render nhưng có thể giết chết hiệu năng game. Game engine phải tính toán ánh sáng và vật lý cho từng đa giác một.

Đối với mô hình xe, cố gắng tuân thủ các hướng dẫn sau:

| LOD | Số đa giác |
| --- | --- |
| L0 (Cao) | Dưới 200k đa giác |
| L1 (Trung bình) | Dưới 50k đa giác |
| L2 (Thấp) | Dưới 5k đa giác |

Luôn đảm bảo mô hình của bạn có LOD (Mức độ chi tiết) phù hợp. Nếu không có LOD, game sẽ render toàn bộ mô hình đa giác cao ngay cả khi xe ở cách xa một dặm.

## Streaming & Quản lý Tài nguyên

Cách bạn tổ chức tài nguyên cũng quan trọng không kém bản thân các tài nguyên đó.

### Kết hợp Tài nguyên
Thay vì có 50 tài nguyên xe riêng lẻ, hãy kết hợp chúng thành một gói duy nhất. Điều này giảm chi phí vận hành của server khi mount tài nguyên.

### Bộ nhớ ảo
Theo dõi mức sử dụng bộ nhớ vật lý của server. Tài nguyên quá lớn có thể gây crash "Hết bộ nhớ" cho người chơi có PC cấu hình thấp.

## Kết luận

Tối ưu hóa là một quá trình liên tục. Bằng cách tuân thủ các hướng dẫn này, bạn đảm bảo trải nghiệm mượt mà hơn cho cộng đồng và giảm số lượng ticket hỗ trợ về "mất texture" hoặc "crash".

Kết hợp với một CDN nhanh như FiveCache để phân phối các tài nguyên đã tối ưu này một cách nhanh chóng, server của bạn sẽ hoạt động tốt hơn bao giờ hết.`,
  },
  {
    slug: 'why-cdn-matters',
    title: 'Tại sao CDN lại Quan trọng đối với Server Đông Người chơi',
    category: 'Giáo dục',
    date: new Date('2025-11-10'),
    readTime: 4,
    excerpt:
      "Đối với các server đông người chơi, Mạng phân phối nội dung (CDN) không chỉ là xa xỉ phẩm; mà là điều thiết yếu.",
    content: `Khi server FiveM của bạn phát triển, bạn có thể bắt đầu nhận thấy những phàn nàn về tốc độ tải xuống chậm, thông báo lỗi "curl error", hoặc người chơi bị timeout khi tham gia. Đây không chỉ là những phiền toái nhỏ—chúng là dấu hiệu cho thấy khả năng phục vụ file trực tiếp của server đang đạt đến giới hạn.

Đối với các server đông người chơi, Mạng phân phối nội dung (CDN) không chỉ là xa xỉ phẩm; mà là điều thiết yếu. Đây là lý do tại sao việc chuyển tài nguyên của bạn sang một CDN toàn cầu như FiveCache có thể thay đổi trải nghiệm người chơi của bạn.

## Nút thắt Băng thông

Khi bạn lưu trữ tài nguyên trực tiếp trên server game (VPS hoặc Dedicated), mỗi người chơi tải xuống xe, bản đồ và quần áo đều tiêu tốn cùng một băng thông mà server sử dụng để đồng bộ vị trí người chơi và trạng thái game.

Kết quả là? Ping cao, lag giật cho người chơi hiện tại và tải xuống chậm cho người chơi đang tham gia. CDN giảm tải 100% lưu lượng này, giải phóng băng thông của server cho những gì quan trọng: gameplay.

## Độ trễ Địa lý

Nếu server của bạn được đặt tại Đức, một người chơi tham gia từ Mỹ hoặc Châu Á sẽ trải qua tốc độ tải xuống chậm do khoảng cách. CDN lưu trữ bản sao các file của bạn tại các trung tâm dữ liệu trên khắp thế giới.

Với FiveCache, một người chơi ở New York sẽ tải file từ một server ở New York, trong khi một người chơi ở London tải từ London. Điều này có thể giảm thời gian tải xuống tới **80%**.

### Không có CDN
- Băng thông server bị bão hòa
- Ping cao khi đông người tham gia
- Điểm lỗi đơn lẻ
- Tốc độ toàn cầu chậm

### Với FiveCache CDN
- Không tải lên server game
- Ping thấp ổn định
- Dự phòng toàn cầu
- Tốc độ tải xuống tối đa

## Độ tin cậy và Bảo vệ DDoS

Việc phục vụ file khiến IP server của bạn dễ bị tấn công. Bằng cách sử dụng CDN, các yêu cầu file được xử lý bởi hạ tầng được bảo vệ của chúng tôi. Ngay cả khi server game của bạn đang bị tấn công, người chơi vẫn có thể tải cache xuống, và khi cuộc tấn công được giảm thiểu, họ đã sẵn sàng tham gia ngay lập tức.`,
  },
]

const DEMO_COUNTRIES = [
  { country: 'Hoa Kỳ', code: 'US' },
  { country: 'Đức', code: 'DE' },
  { country: 'Vương quốc Anh', code: 'GB' },
  { country: 'Ý', code: 'IT' },
  { country: 'Pháp', code: 'FR' },
  { country: 'Brazil', code: 'BR' },
  { country: 'Hà Lan', code: 'NL' },
  { country: 'Tây Ban Nha', code: 'ES' },
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
  console.log('Đang seed dữ liệu cho cơ sở dữ liệu FiveCache...')

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
      name: 'Người dùng Demo',
      passwordHash: hashPassword('demo1234'),
      emailVerified: new Date(),
      plan: 'pro_plus',
      balanceVnd: 10_000_000, // cấp đủ số dư cho người dùng demo để test shield
    },
  })
  console.log(`Đã tạo người dùng demo: ${demoUser.email} (số dư: ${demoUser.balanceVnd.toLocaleString()}đ)`)

  const serverId = 'demo1abc2'
  const domain = `${serverId}.fivecache.site`
  const cacheUrl = `https://${domain}/files`
  const cacheServer = await db.cacheServer.create({
    data: {
      userId: demoUser.id,
      serverId,
      name: 'Server Roleplay của tôi',
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

  // Server Shield demo
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
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // còn 25 ngày
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
  console.log(`Đã tạo shield demo: ${shield.code} (key: ${shield.adhesiveKey.slice(0, 8)}...)`)
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

  console.log(`Đã tạo cache server: ${cacheServer.name}`)

  for (const post of BLOG_POSTS) {
    await db.blogPost.create({ data: post })
  }
  console.log(`Đã tạo ${BLOG_POSTS.length} bài viết blog`)
  console.log('Seed hoàn tất.')
  console.log('Đăng nhập bằng: demo@fivecache.site / demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())