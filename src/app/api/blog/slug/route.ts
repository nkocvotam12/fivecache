import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const STATIC_POSTS: Record<string, {
  slug: string
  title: string
  category: string
  date: string
  readTime: number
  excerpt: string
  content: string
}> = {
  'multi-server-support': {
    slug: 'multi-server-support',
    title: 'Quản lý Nhiều Server với Một Tài khoản',
    category: 'Tính năng mới',
    date: '2025-12-06T00:00:00.000Z',
    readTime: 2,
    excerpt: 'Chúng tôi vui mừng thông báo bản cập nhật lớn cho FiveCache: Hỗ trợ Đa Server.',
    content: `Chúng tôi vui mừng thông báo bản cập nhật lớn cho **FiveCache**: *Hỗ trợ Đa Server*.

Nhiều người dùng của chúng tôi quản lý cộng đồng với nhiều phiên bản server FiveM khác nhau. Cho đến nay, việc quản lý cache cho từng server này đòi hỏi phải thiết lập riêng biệt hoặc dùng các giải pháp tạm thời.

## Có gì mới?
- **Bảng điều khiển hợp nhất:** Xem và quản lý tất cả các server của bạn từ một bảng điều khiển duy nhất.
- **Cache biệt lập:** Mỗi server có một môi trường cache riêng biệt.
- **Gói dịch vụ linh hoạt:** Nâng cấp từng server khi cần.`,
  },
  'optimizing-fivem-assets': {
    slug: 'optimizing-fivem-assets',
    title: 'Tối ưu hóa Tài nguyên FiveM để Tăng hiệu năng',
    category: 'Giáo dục',
    date: '2025-11-20T00:00:00.000Z',
    readTime: 5,
    excerpt: 'Xe, quần áo và bản đồ chưa được tối ưu là nguyên nhân số 1 gây mất texture, FPS thấp và crash client.',
    content: `Vận hành một server FiveM hiệu năng cao đòi hỏi tài nguyên được tối ưu.

## Nén Texture (YTD)
- Giảm kích thước texture xuống tối đa 1024x1024 hoặc 2048x2048.
- Sử dụng nén DXT1/DXT5 phù hợp.
- Hướng đến các file .ytd của xe dưới 10MB.`,
  },
  'why-cdn-matters': {
    slug: 'why-cdn-matters',
    title: 'Tại sao CDN lại Quan trọng đối với Server Đông Người chơi',
    category: 'Giáo dục',
    date: '2025-11-10T00:00:00.000Z',
    readTime: 4,
    excerpt: "Đối với các server đông người chơi, Mạng phân phối nội dung (CDN) không chỉ là xa xỉ phẩm; mà là điều thiết yếu.",
    content: `Khi bạn lưu trữ tài nguyên trực tiếp trên server game, mỗi người chơi tải xuống tài nguyên đều tiêu tốn vào tick rate của game và trạng thái mạng.

CDN giảm tải 100% lưu lượng này, giải phóng băng thông của server.`,
  },
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Yêu cầu tham số slug.' }, { status: 400 })
  }

  try {
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (post) return NextResponse.json({ post })
  } catch {
    // dự phòng (fallback)
  }

  const staticPost = STATIC_POSTS[slug]
  if (staticPost) {
    return NextResponse.json({ post: staticPost })
  }

  return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
}