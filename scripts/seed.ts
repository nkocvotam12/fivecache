// Seed script - chạy với: bun run scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const db = new PrismaClient()

const BLOG_POSTS = [
  {
    slug: 'multi-server-support',
    title: 'Quản lý Nhiều Máy chủ với Một Tài khoản',
    category: 'Tính năng Mới',
    date: new Date('2025-12-06'),
    readTime: 2,
    excerpt:
      'Chúng tôi vui mừng thông báo một cập nhật lớn cho FiveCache: Hỗ trợ Đa Máy chủ.',
    content: `Chúng tôi vui mừng thông báo một cập nhật lớn cho **FiveCache**: *Hỗ trợ Đa Máy chủ*.

Nhiều người dùng của chúng tôi quản lý cộng đồng với nhiều phiên bản máy chủ FiveM—có thể là máy chủ roleplay, máy chủ đấu trường, hoặc môi trường phát triển. Cho đến nay, việc quản lý bộ nhớ đệm cho từng máy chủ này đòi hỏi thiết lập riêng biệt hoặc các giải pháp tạm thời.

## Có gì mới?

- **Bảng điều khiển Hợp nhất:** Xem và quản lý tất cả máy chủ của bạn từ một bảng điều khiển duy nhất.
- **Bộ nhớ đệm Cách ly:** Mỗi máy chủ có môi trường bộ nhớ đệm cách ly riêng, đảm bảo không xung đột giữa các tài nguyên.
- **Gói Có thể Mở rộng:** Nâng cấp từng máy chủ khi cần mà không ảnh hưởng đến các phiên bản khác.

Cập nhật này đơn giản hóa quy trình làm việc cho chủ sở hữu cộng đồng và nhà phát triển, cho phép bạn tập trung vào điều quan trọng nhất: tạo ra trải nghiệm tuyệt vời cho người chơi của bạn.

## Cách bắt đầu

Chỉ cần đăng nhập vào bảng điều khiển của bạn, và bạn sẽ thấy tùy chọn mới "Thêm Máy chủ". Làm theo hướng dẫn thiết lập để tích hợp FiveCache với các phiên bản máy chủ bổ sung của bạn.

> Truy cập Bảng điều khiển để dùng thử ngay.`,
  },
  {
    slug: 'optimizing-fivem-assets',
    title: 'Tối ưu hóa Tài nguyên FiveM để có Hiệu suất Tốt hơn',
    category: 'Giáo dục',
    date: new Date('2025-11-20'),
    readTime: 5,
    excerpt:
      'Xe, quần áo và bản đồ chưa được tối ưu là nguyên nhân số 1 gây mất texture, FPS thấp và crash client.',
    content: `Vận hành một máy chủ FiveM hiệu suất cao đòi hỏi nhiều hơn phần cứng tốt; nó cần tài nguyên được tối ưu. Xe, quần áo và bản đồ chưa được tối ưu là nguyên nhân số 1 gây mất texture (lỗi "city bug" đáng sợ), FPS thấp và crash client.

Trong hướng dẫn này, chúng tôi sẽ đề cập các bước thiết yếu để đảm bảo tài nguyên tùy chỉnh của bạn gọn gàng, mạnh mẽ và sẵn sàng cho số lượng người chơi cao.

## Nén Texture (YTD)

Texture thường là phần nặng nhất của bất kỳ tài nguyên nào. Nhiều bản mod xe đi kèm texture 4K hoặc thậm chí 8K hoàn toàn không cần thiết cho một game engine như GTA V.

- **Thay đổi kích thước texture:** Thu nhỏ texture xuống tối đa 1024x1024 hoặc 2048x2048 cho xe lớn.
- **Sử dụng nén DXT:** Đảm bảo tệp .ytd của bạn sử dụng nén DXT1/DXT5 phù hợp.
- **Kích thước mục tiêu:** Hướng tới tệp .ytd xe dưới 10MB. Bất kỳ tệp nào trên 16MB có thể gây vấn đề mất texture.

## Số lượng Polygon (YFT)

Mô hình high-poly trông tuyệt vời trong render nhưng có thể giết chết hiệu suất game. Game engine phải tính toán ánh sáng và vật lý cho từng polygon.

Đối với mô hình xe, cố gắng tuân theo các hướng dẫn sau:

| LOD | Polygon |
| --- | --- |
| L0 (Cao) | Dưới 200k poly |
| L1 (Trung bình) | Dưới 50k poly |
| L2 (Thấp) | Dưới 5k poly |

Luôn đảm bảo mô hình của bạn có LOD (Level of Detail) phù hợp. Không có LOD, game sẽ render toàn bộ mô hình high-poly ngay cả khi xe ở cách xa một dặm.

## Streaming & Quản lý Tài nguyên

Cách bạn tổ chức tài nguyên quan trọng không kém gì bản thân tài nguyên.

### Kết hợp Tài nguyên
Thay vì có 50 tài nguyên xe riêng lẻ, hãy kết hợp chúng thành một gói duy nhất. Điều này giảm chi phí máy chủ khi gắn kết tài nguyên.

### Bộ nhớ Ảo
Giám sát mức sử dụng bộ nhớ vật lý của máy chủ. Tài nguyên quá lớn có thể gây crash "Hết bộ nhớ" cho người chơi có PC cấu hình thấp.

## Kết luận

Tối ưu hóa là một quá trình liên tục. Bằng cách tuân theo các hướng dẫn này, bạn đảm bảo trải nghiệm mượt mà hơn cho cộng đồng và giảm số lượng yêu cầu hỗ trợ về "mất texture" hoặc "crash".

Kết hợp với CDN nhanh như FiveCache để phân phối các tài nguyên đã tối ưu này một cách nhanh chóng, máy chủ của bạn sẽ hoạt động tốt hơn bao giờ hết.`,
  },
  {
    slug: 'why-cdn-matters',
    title: 'Tại sao CDN lại Quan trọng đối với Máy chủ Đông Người chơi',
    category: 'Giáo dục',
    date: new Date('2025-11-10'),
    readTime: 4,
    excerpt:
      "Đối với máy chủ đông người chơi, Mạng Phân phối Nội dung (CDN) không chỉ là xa xỉ phẩm; nó là nhu cầu thiết yếu.",
    content: `Khi máy chủ FiveM của bạn phát triển, bạn có thể bắt đầu nhận thấy các phàn nàn về tốc độ tải xuống chậm, thông báo "curl error", hoặc người chơi bị timeout khi tham gia. Đây không chỉ là những phiền toái nhỏ—chúng là dấu hiệu cho thấy khả năng phục vụ tệp trực tiếp của máy chủ đang đạt đến giới hạn.

Đối với máy chủ đông người chơi, Mạng Phân phối Nội dung (CDN) không chỉ là xa xỉ phẩm; nó là nhu cầu thiết yếu. Đây là lý do tại sao việc chuyển tài nguyên của bạn sang CDN toàn cầu như FiveCache có thể thay đổi trải nghiệm người chơi của bạn.

## Nút thắt Băng thông

Khi bạn lưu trữ tài nguyên trực tiếp trên máy chủ game (VPS hoặc Dedicated), mỗi người chơi tải xuống xe, bản đồ và quần áo đều tiêu tốn cùng một băng thông mà máy chủ sử dụng để đồng bộ vị trí người chơi và trạng thái game.

Kết quả? Ping cao, giật lag cho người chơi hiện tại, và tải xuống chậm cho người chơi mới tham gia. CDN giảm tải 100% lưu lượng này, để băng thông máy chủ của bạn rảnh cho điều quan trọng: gameplay.

## Độ trễ Địa lý

Nếu máy chủ của bạn được lưu trữ ở Đức, một người chơi tham gia từ Mỹ hoặc Châu Á sẽ trải nghiệm tốc độ tải xuống chậm do khoảng cách. CDN lưu trữ bản sao tệp của bạn trong các trung tâm dữ liệu trên khắp thế giới.

Với FiveCache, một người chơi ở New York tải xuống tệp từ máy chủ New York, trong khi một người chơi ở London tải xuống từ London. Điều này có thể giảm thời gian tải xuống lên đến **80%**.

### Không có CDN
- Băng thông máy chủ bị bão hòa
- Ping cao khi nhiều người tham gia
- Điểm lỗi duy nhất
- Tốc độ toàn cầu chậm

### Với FiveCache CDN
- Không tải trên máy chủ game
- Ping thấp ổn định
- Dự phòng toàn cầu
- Tốc độ tải xuống tối đa

## Độ tin cậy và Bảo vệ DDoS

Phục vụ tệp khiến IP máy chủ của bạn tiếp xúc với các cuộc tấn công tiềm năng. Bằng cách sử dụng CDN, các yêu cầu tệp được xử lý bởi cơ sở hạ tầng được bảo vệ của chúng tôi. Ngay cả khi máy chủ game của bạn đang bị tấn công, người chơi vẫn có thể tải xuống bộ nhớ đệm, và khi cuộc tấn công được giảm thiểu, họ đã sẵn sàng tham gia ngay lập tức.`,
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
  console.log('Đang seed cơ sở dữ liệu FiveCache...')

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
    },
  })
  console.log(`Đã tạo người dùng demo: ${demoUser.email}`)

  const serverId = 'demo1abc2'
  const domain = `${serverId}.fivecache.site`
  const cacheUrl = `https://${domain}/files`
  const cacheServer = await db.cacheServer.create({
    data: {
      userId: demoUser.id,
      serverId,
      name: 'Máy chủ Roleplay của tôi',
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

  console.log(`Đã tạo máy chủ cache: ${cacheServer.name}`)

  for (const post of BLOG_POSTS) {
    await db.blogPost.create({ data: post })
  }
  console.log(`Đã tạo ${BLOG_POSTS.length} bài viết blog`)

  console.log('Seed hoàn tất.')
  console.log('Đăng nhập với: demo@fivecache.site / demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())