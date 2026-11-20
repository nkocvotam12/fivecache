# FiveCache - FiveM CDN Caching Management Service

Dự án quản lý và định tuyến lưu trữ đệm (CDN Caching Service) dành riêng cho máy chủ FiveM, được xây dựng trên nền tảng **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, và **Prisma ORM (SQLite)**.

---

## 📌 Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cơ chế hoạt động của FiveM Cache](#2-cơ-chế-hoạt-động-của-fivem-cache)
3. [Hướng dẫn cài đặt & Chạy trên máy Local (Windows / Linux)](#3-hướng-dẫn-cài-đặt--chạy-trên-máy-local)
4. [Tài khoản đăng nhập thử nghiệm](#4-tài-khoản-đăng-nhập-thử-nghiệm)
5. [Cấu trúc Backend & Danh sách API](#5-cấu-trúc-backend--danh-sách-api)
6. [Hướng dẫn triển khai Production (Tên miền, Cloudflare & Edge Proxy)](#6-hướng-dẫn-triển-khai-production)
7. [Câu hỏi thường gặp (FAQ)](#7-câu-hỏi-thường-gặp-faq)

---

## 1. Tổng quan kiến trúc

Source code hiện tại bao gồm 2 phần chính:
- **Frontend Dashboard & Landing Page:**
  - Trang chủ giới thiệu tính năng, bảng giá gói dịch vụ (Hobby, Pro Plus, Doanh nghiệp).
  - Cổng thông tin khách hàng: Đăng ký, đăng nhập, quên mật khẩu, xác thực email.
  - Dashboard quản trị: Quản lý danh sách FiveM Server, cấu hình IP/Port máy chủ gốc, lấy link CDN `fileserver_add`, xem biểu đồ thống kê băng thông, tỷ lệ Cache Hit Rate, Top file tải nhiều, Top quốc gia.
  - Hệ thống Blog & hướng dẫn tối ưu tài nguyên FiveM.
- **Backend API (Next.js Route Handlers):**
  - Hệ thống xác thực bằng Session Token lưu Cookie (`fivecache_session`), băm mật khẩu PBKDF2 bằng Node.js `crypto`.
  - Quản lý Database qua Prisma ORM kết nối SQLite.
  - Xử lý CRUD máy chủ, tính toán giới hạn slot theo gói dịch vụ, cấp phát mã `SERVER_ID` ngẫu nhiên.

---

## 2. Cơ chế hoạt động của FiveM Cache

Khi một người chơi kết nối vào máy chủ FiveM:
1. Mặc định, game client tải toàn bộ resources (xe cộ, bản đồ, script `.ytd`, `.yft`) trực tiếp từ máy chủ game (`http://<ip>:<port>/files/...`). Điều này làm nghẽn băng thông máy chủ game và gây giật lag (desync/crash).
2. Khi cấu hình lệnh sau vào `server.cfg`:
   ```cfg
   fileserver_add ".*" "https://<SERVER_ID>.fivecache.site/files"
   ```
3. Client FiveM sẽ chuyển hướng toàn bộ việc tải file sang hệ thống CDN.
4. **Hệ thống Caching:**
   - **Cache Hit:** Nếu file đã có trên CDN, trả về ngay lập tức với tốc độ đường truyền tối đa của CDN.
   - **Cache Miss:** Nếu file chưa có, CDN tải từ máy chủ FiveM gốc của bạn (`serverIp:serverPort`), lưu lại bản sao vào ổ cứng SSD/NVMe, rồi gửi cho người chơi.

---

## 3. Hướng dẫn cài đặt & Chạy trên máy Local

### Bước 1: Cài đặt biến môi trường `.env`
Mở file `.env` ở thư mục gốc và cấu hình đường dẫn SQLite phù hợp với máy của bạn:

```env
DATABASE_URL="file:./dev.db"
```

### Bước 2: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 3: Khởi tạo CSDL (Prisma)
Chạy 2 lệnh sau để sinh client Prisma và tạo các bảng trong cơ sở dữ liệu:
```bash
npx prisma generate
npx prisma db push
```

### Bước 4: Nạp dữ liệu mẫu (Seed Demo Data)
Chạy script seed để tạo tài khoản demo, máy chủ mẫu và các chỉ số thống kê:
```bash
npx tsx scripts/seed.ts
```

### Bước 5: Khởi chạy môi trường phát triển
```bash
npx next dev -p 3000
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 4. Tài khoản đăng nhập thử nghiệm

Sau khi chạy lệnh seed ở bước 4, bạn có thể đăng nhập ngay với thông tin sau:
- **Email:** `demo@fivecache.site`
- **Mật khẩu:** `demo1234`
- **Gói dịch vụ mặc định:** `Pro Plus` (cho phép tạo tối đa 5 slot máy chủ, xem đầy đủ phân tích thống kê)

---

## 5. Cấu trúc Backend & Danh sách API

Tất cả các API nằm trong thư mục `src/app/api/`:

| Phương thức | Đường dẫn API | Chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập & cấp phát Session Cookie |
| `POST` | `/api/auth/logout` | Đăng xuất & hủy phiên |
| `GET` | `/api/auth/me` | Lấy thông tin người dùng đang đăng nhập |
| `POST` | `/api/auth/forgot-password` | Yêu cầu khôi phục mật khẩu |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu mới |
| `GET` | `/api/dashboard/servers` | Danh sách server & số slot khả dụng |
| `POST` | `/api/dashboard/servers` | Thêm máy chủ mới (tự sinh `serverId` & `domain`) |
| `PATCH`| `/api/dashboard/servers` | Cập nhật tên/thông tin server |
| `POST` | `/api/dashboard/config` | Cập nhật IP và Port của máy chủ FiveM gốc |
| `GET` | `/api/dashboard/stats` | Dữ liệu thống kê băng thông, requests, biểu đồ |
| `POST` | `/api/dashboard/clear-cache` | Xóa bộ nhớ đệm (dành cho gói Pro Plus trở lên) |
| `GET` | `/api/blog/list` | Danh sách bài viết blog |
| `GET` | `/api/blog/slug?slug=...` | Chi tiết bài viết theo slug |

---

## 6. Hướng dẫn triển khai Production

### Bạn có cần mua tên miền và dùng Cloudflare không?

- **Khi chạy thử nghiệm (Local / Development):**
  - **KHÔNG CẦN.** Bạn chỉ cần chạy trên `localhost:3000` để kiểm tra toàn bộ tính năng website, quản trị người dùng và giao diện dashboard.

- **Khi triển khai thực tế thành dịch vụ CDN cho FiveM:**
  - **CẦN MUA 1 TÊN MIỀN** (ví dụ: `yourdomain.com`).
  - **CẦN DÙNG CLOUDFLARE:** Vì FiveM kết nối qua đường dẫn subdomain dạng `https://<SERVER_ID>.yourdomain.com/files`. Cloudflare hỗ trợ:
    1. Quản lý DNS Wildcard (`*.yourdomain.com`) trỏ về máy chủ proxy.
    2. Cấp chứng chỉ SSL/TLS miễn phí cho toàn bộ subdomain (`*.yourdomain.com`).
    3. Bảo vệ chống DDoS layer 7 và tối ưu CDN Edge Caching.

---

### Mô hình triển khai Production thực tế:

Hệ thống hoàn chỉnh ngoài đời gồm 2 thành phần:

```
[ Người chơi FiveM ]
        │
        ▼ (Tải https://abc12345.yourdomain.com/files/...)
[ Cloudflare DNS (*.yourdomain.com) ]
        │
        ▼
[ Edge Caching Proxy (Nginx / Caddy / Cloudflare Worker) ]
        ├── (Đã có cache) ──────> Trả file ngay lập tức cho client
        └── (Chưa có cache) ────> Hỏi CSDL lấy Origin IP:Port FiveM
                                        │
                                        ▼ (Tải file gốc)
                                [ Máy chủ FiveM Server ]
```

#### Cấu hình Nginx Proxy mẫu (cho Edge Caching):
```nginx
# Cấu hình cache path
proxy_cache_path /var/cache/fivem levels=1:2 keys_zone=fivem_cache:100m max_size=100g inactive=7d use_temp_path=off;

server {
    server_name ~^(?<server_id>.+)\.yourdomain\.com$;
    listen 80;
    listen 443 ssl;

    location /files/ {
        # Đọc origin IP & Port từ CSDL hoặc biến proxy nội bộ
        # Ví dụ proxy tới FiveM server gốc:
        proxy_pass http://$backend_fivem_origin:30120/files/;

        proxy_cache fivem_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_use_stale error timeout updating;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

---

## 7. Câu hỏi thường gặp (FAQ)

**Q: Source code này đã có phần tự động lưu và cache file `.ytd`, `.yft` chưa?**  
*A:* Source code hiện tại là **Trang web quản trị SaaS (Management Portal)**. Nó cung cấp toàn bộ UI, quản lý người dùng, database cấu hình IP:Port và dữ liệu dashboard. Để cache file FiveM thực tế, bạn cần dựng một máy chủ Reverse Proxy (Nginx/Caddy) hoặc dùng Cloudflare Cache Rules nối với IP:Port của máy chủ FiveM gốc như hướng dẫn ở Mục 6.

**Q: Tôi có thể đổi SQLite sang PostgreSQL hoặc MySQL không?**  
*A:* Hoàn toàn được. Trong file `prisma/schema.prisma`, thay `provider = "sqlite"` thành `provider = "postgresql"` hoặc `provider = "mysql"`, sau đó cập nhật chuỗi kết nối trong `.env` và chạy `npx prisma db push`.
# fivecache
