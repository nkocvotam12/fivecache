'use client'

import { Database, Activity, Zap, Server, Globe, HardDrive, TrendingUp, BarChart3, Shield, Layers, Workflow, Network } from 'lucide-react'

// Định nghĩa tính năng tập trung được sử dụng trên landing + dashboard
export const FEATURE_CARDS = [
  {
    icon: Database,
    title: 'Quản lý Tệp Cache',
    description: 'Tối ưu hóa việc quản lý tệp cache FiveM của bạn với các công cụ CDN tích hợp.',
    logs: [
      { level: 'INFO', color: 'bg-blue-400', msg: 'Tệp cache đã được tải lên thành công', time: '2 giây trước' },
      { level: 'SUCCESS', color: 'bg-green-400', msg: 'Tệp đã được phân phối đến 15 vị trí edge', time: '1 phút trước' },
    ],
  },
  {
    icon: Activity,
    title: 'Giám sát Hiệu suất Cache',
    description: 'Theo dõi tỷ lệ trúng cache và hiệu suất phân phối theo thời gian thực.',
    logs: [
      { level: 'INFO', color: 'bg-blue-400', msg: 'Máy chủ cache đã khởi động. Đang giám sát hiệu suất.', time: '1 phút trước' },
      { level: 'ACTION', color: 'bg-green-400', msg: 'Người chơi đã tải xuống tài nguyên được lưu trong cache.', time: '3 phút trước' },
    ],
  },
  {
    icon: Zap,
    title: 'CDN Siêu Tốc',
    description: 'Phân phối tệp cache và nội dung FiveM với tốc độ cực nhanh bằng mạng CDN toàn cầu của chúng tôi.',
    network: true,
  },
] as const

export const SECONDARY_FEATURES = [
  {
    icon: Zap,
    title: 'Phân phối Nội dung Nhanh',
    description: 'Phân phối tệp cache và tài nguyên FiveM nhanh chóng với mạng CDN toàn cầu tốc độ cao.',
  },
  {
    icon: BarChart3,
    title: 'Ghi log Cache Liền mạch',
    description: 'Dễ dàng theo dõi và lưu trữ nhật ký truy cập cache và phân tích phân phối để có thông tin chi tiết hơn.',
  },
  {
    icon: Server,
    title: 'Tối ưu cho Máy chủ FiveM',
    description: 'Được thiết kế riêng để đáp ứng nhu cầu lưu trữ cache của máy chủ trò chơi FiveM và cộng đồng.',
  },
  {
    icon: Workflow,
    title: 'Tích hợp Cache Đơn giản',
    description: 'Thiết lập và tích hợp FiveCache với máy chủ FiveM của bạn với cấu hình tối thiểu.',
  },
  {
    icon: Shield,
    title: 'Hiệu suất Cache Đáng tin cậy',
    description: 'Đảm bảo hiệu suất phân phối cache nhất quán và đáng tin cậy cho người chơi của bạn.',
  },
  {
    icon: Layers,
    title: 'Giải pháp Cache Có thể Mở rộng',
    description: 'Phát triển dễ dàng với cơ sở hạ tầng cache được thiết kế cho máy chủ FiveM lưu lượng cao.',
  },
] as const

export const STAT_CARDS = [
  { icon: Database, label: 'Tệp Cache đã Phục vụ', value: '2.5M+', color: 'text-yellow-400' },
  { icon: Server, label: 'Máy chủ FiveM Hoạt động', value: '80+', color: 'text-yellow-400' },
  { icon: Globe, label: 'Vị trí Edge Toàn cầu', value: '25+', color: 'text-yellow-400' },
  { icon: Activity, label: 'Phản hồi Cache Trung bình', value: '<15ms', color: 'text-yellow-400' },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    icon: Network,
    title: 'Thêm Dòng Cấu hình',
    description: 'Thêm dòng duy nhất này vào tệp server.cfg của máy chủ FiveM',
  },
  {
    icon: Server,
    title: 'Khởi động lại Máy chủ',
    description: 'Chỉ cần khởi động lại máy chủ FiveM của bạn để kích hoạt tích hợp CDN. Không cần cấu hình thêm.',
  },
  {
    icon: TrendingUp,
    title: 'Tự động Lưu Cache',
    description: 'Tài nguyên máy chủ của bạn giờ đây được phục vụ toàn cầu! Người chơi tải xuống tài nguyên từ vị trí edge gần nhất.',
  },
] as const

export const CDN_EDGES = [
  { name: 'US-East', x: 30, y: 40 },
  { name: 'EU-West', x: 55, y: 35 },
  { name: 'Asia', x: 75, y: 55 },
  { name: 'US-West', x: 18, y: 55 },
] as const

export const CDN_BENEFITS = [
  'Thời gian kết nối của người chơi nhanh hơn',
  'Giảm băng thông sử dụng của máy chủ',
  'Phạm vi toàn cầu cho người chơi quốc tế',
  'Cải thiện hiệu suất máy chủ',
  'Phân tích phân phối theo thời gian thực',
  'Cam kết thời gian hoạt động 99.9%',
] as const