// Các gói giá cho FiveCache
export type PricingPlan = {
  id: string
  name: string
  price: number
  currency: string
  period: string
  description: string
  features: string[]
  highlight?: boolean
  accentGradient?: string
  ctaLabel: string
  slots?: number
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 10,
    currency: '€',
    period: '/tháng',
    description: 'Dành cho các máy chủ FiveM đơn lẻ mới bắt đầu với lưu trữ đệm.',
    features: [
      '50GB bộ nhớ đệm NVME SSD',
      'Lưu lượng truy cập không giới hạn',
      'Tên miền công khai *.fivecache.site',
      'Hỗ trợ qua email',
      'Thống kê thời gian thực cơ bản',
      '1 slot máy chủ FiveM',
    ],
    accentGradient: 'from-zinc-400 to-zinc-600',
    ctaLabel: 'Bắt đầu',
    slots: 1,
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: 25,
    currency: '€',
    period: '/tháng',
    description: 'Dành cho các cộng đồng nghiêm túc hoặc mạng lưới nhiều máy chủ.',
    features: [
      'Bộ nhớ đệm NVME SSD không giới hạn',
      'Lưu lượng truy cập không giới hạn',
      'Tên miền công khai *.fivecache.site',
      'Hỗ trợ ưu tiên 24/7',
      'Thống kê thời gian thực',
      '5 slot máy chủ FiveM',
      'Xóa bộ nhớ đệm & thanh lọc CDN',
    ],
    highlight: true,
    accentGradient: 'from-yellow-400 to-yellow-600',
    ctaLabel: 'Bắt đầu',
    slots: 5,
  },
  {
    id: 'custom_evarose',
    name: 'Doanh nghiệp',
    price: 99,
    currency: '€',
    period: '/tháng',
    description: 'Dành cho các mạng lưới lớn cần cơ sở hạ tầng tùy chỉnh.',
    features: [
      'Mọi thứ trong Pro Plus',
      'Cấu hình CDN tùy chỉnh',
      'Vị trí edge chuyên dụng',
      'Truy cập API & webhooks',
      'Hỗ trợ tên miền tùy chỉnh',
      'Slot máy chủ không giới hạn',
      'Quản lý tài khoản chuyên dụng',
    ],
    accentGradient: 'from-purple-400 to-purple-600',
    ctaLabel: 'Liên hệ Kinh doanh',
    slots: 999,
  },
]

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === id)
}