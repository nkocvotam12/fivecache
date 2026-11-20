'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Zap, Mail } from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

export default function LegalPage() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors text-sm mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại Trang chủ
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-black" fill="currentColor" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Điều khoản Pháp lý</h1>
            </div>

            <p className="text-zinc-400 mb-8">
              Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ FiveCache.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800 mb-8">
              <button
                onClick={() => setTab('terms')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'terms'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Điều khoản Dịch vụ
              </button>
              <button
                onClick={() => setTab('privacy')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'privacy'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Chính sách Bảo mật
              </button>
            </div>

            {tab === 'terms' ? <TermsOfService /> : <PrivacyPolicy />}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function TermsOfService() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Điều khoản Dịch vụ – FiveCache</h2>
        <p className="text-sm text-zinc-500">Cập nhật lần cuối: 19/09/2025</p>
      </header>

      <p className="text-zinc-300 leading-relaxed">
        Chào mừng bạn đến với FiveCache (fivecache.site). Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý với các
        Điều khoản Dịch vụ sau đây. Vui lòng đọc kỹ chúng.
      </p>

      <Section number={1} title="Dịch vụ Cung cấp">
        <p>
          FiveCache cung cấp dịch vụ lưu trữ đệm tệp (cache) và phân phối nội dung được thiết kế cho các máy chủ FiveM
          và các ứng dụng liên quan.
        </p>
        <p>
          Dịch vụ được cung cấp &quot;nguyên trạng,&quot; không có bảo đảm về tính khả dụng liên tục hoặc hoạt động
          không có lỗi.
        </p>
      </Section>

      <Section number={2} title="Sử dụng Hợp lý">
        <ul>
          <li>
            Bạn không được sử dụng FiveCache để phân phối nội dung bất hợp pháp, tài liệu có bản quyền mà không được
            phép, hoặc phần mềm độc hại (mã độc, lừa đảo, v.v.).
          </li>
          <li>
            Nghiêm cấm lạm dụng dịch vụ (bao gồm tấn công từ chối dịch vụ, vượt qua các hạn chế, hoặc hoạt động gây
            hại đối với bên thứ ba).
          </li>
          <li>
            Bạn hoàn toàn chịu trách nhiệm về nội dung mà bạn lưu trữ đệm, lưu trữ hoặc phân phối qua FiveCache.
          </li>
        </ul>
      </Section>

      <Section number={3} title="Tài khoản và Truy cập">
        <ul>
          <li>Một số tính năng nhất định có thể yêu cầu đăng ký.</li>
          <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
          <li>
            FiveCache bảo lưu quyền tạm ngưng hoặc chấm dứt quyền truy cập nếu phát hiện hoạt động đáng ngờ hoặc lạm
            dụng.
          </li>
        </ul>
      </Section>

      <Section number={4} title="Tính Khả dụng và Trách nhiệm">
        <ul>
          <li>
            Mặc dù chúng tôi nỗ lực cung cấp thời gian hoạt động liên tục, chúng tôi không đảm bảo khả dụng 100%.
          </li>
          <li>
            FiveCache không chịu trách nhiệm pháp lý đối với bất kỳ mất mát dữ liệu, thời gian ngừng hoạt động, hoặc
            thiệt hại nào phát sinh từ việc sử dụng dịch vụ.
          </li>
        </ul>
      </Section>

      <Section number={5} title="Sửa đổi">
        <p>
          Chúng tôi có thể cập nhật các Điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi
          đồng nghĩa với việc chấp nhận.
        </p>
      </Section>

      <Section number={6} title="Chính sách Hoàn tiền">
        <p>Tất cả các gói đăng ký FiveCache đều được thanh toán trước.</p>
        <p>
          Hoàn tiền thường không được cung cấp cho các kỳ đăng ký một phần, thời gian chưa sử dụng, hoặc hạ cấp gói.
        </p>
        <p>
          Hoàn tiền chỉ có thể được phát hành trong các trường hợp đặc biệt (ví dụ: thanh toán trùng lặp, sự cố dịch
          vụ đã được chứng minh trong thời gian dài).
        </p>
        <p>
          Nếu bạn tin rằng mình đủ điều kiện được hoàn tiền, bạn phải liên hệ với nhóm hỗ trợ của chúng tôi trong vòng
          7 ngày kể từ ngày thanh toán.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-zinc-400 mb-3">Có câu hỏi?</p>
        <p className="text-zinc-300 mb-4">
          Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi.
        </p>
        <a
          href="mailto:support@fivecache.site"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-6 py-2 rounded-lg font-semibold transition-all"
        >
          <Mail className="h-4 w-4" />
          Liên hệ Hỗ trợ
        </a>
      </div>
    </article>
  )
}

function PrivacyPolicy() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Chính sách Bảo mật – FiveCache</h2>
        <p className="text-sm text-zinc-500">Cập nhật lần cuối: 19/09/2025</p>
      </header>

      <p className="text-zinc-300 leading-relaxed">
        Chính sách Bảo mật này giải thích cách FiveCache (&quot;chúng tôi&quot;, &quot;của chúng tôi&quot;) thu thập,
        sử dụng và bảo vệ thông tin của bạn khi bạn sử dụng dịch vụ lưu trữ đệm và phân phối nội dung của chúng tôi.
      </p>

      <Section number={1} title="Thông tin Chúng tôi Thu thập">
        <ul>
          <li>
            <strong>Thông tin tài khoản:</strong> tên, địa chỉ email và mật khẩu đã băm khi bạn đăng ký.
          </li>
          <li>
            <strong>Cấu hình máy chủ:</strong> tên máy chủ FiveM, IP và cổng bạn cung cấp cho mục đích lưu trữ đệm.
          </li>
          <li>
            <strong>Dữ liệu sử dụng:</strong> số lượng yêu cầu, băng thông, tỷ lệ trúng bộ nhớ đệm và các chỉ số phân
            tích được sử dụng để hiển thị bảng điều khiển của bạn.
          </li>
          <li>
            <strong>Dữ liệu nhật ký:</strong> địa chỉ IP, dấu thời gian yêu cầu và mã trạng thái HTTP cho mục đích bảo
            mật và phòng chống lạm dụng.
          </li>
        </ul>
      </Section>

      <Section number={2} title="Cách Chúng tôi Sử dụng Thông tin của Bạn">
        <ul>
          <li>Để vận hành, duy trì và cải thiện dịch vụ FiveCache.</li>
          <li>Để giám sát hiệu suất bộ nhớ đệm và cung cấp phân tích thời gian thực.</li>
          <li>Để phát hiện, ngăn chặn và giải quyết các sự cố kỹ thuật, gian lận hoặc lạm dụng.</li>
          <li>Để liên lạc với bạn về tài khoản của bạn và các cập nhật quan trọng.</li>
        </ul>
      </Section>

      <Section number={3} title="Chia sẻ Dữ liệu">
        <p>
          Chúng tôi không bán thông tin cá nhân của bạn. Các chỉ số tổng hợp, ẩn danh có thể được chia sẻ với đối tác
          hoặc sử dụng trong tài liệu tiếp thị. Chúng tôi có thể tiết lộ thông tin khi được pháp luật yêu cầu hoặc để
          bảo vệ quyền lợi của chúng tôi và sự an toàn của người khác.
        </p>
      </Section>

      <Section number={4} title="Lưu trữ Dữ liệu">
        <p>
          Chúng tôi lưu giữ thông tin tài khoản của bạn chừng nào tài khoản của bạn còn hoạt động. Dữ liệu phân tích
          được tổng hợp và lưu giữ tối đa 24 tháng. Bạn có thể yêu cầu xóa tài khoản của mình bất cứ lúc nào bằng cách
          liên hệ với bộ phận hỗ trợ.
        </p>
      </Section>

      <Section number={5} title="Bảo mật">
        <p>
          Chúng tôi sử dụng các thực tiễn tiêu chuẩn trong ngành để bảo vệ dữ liệu của bạn, bao gồm mật khẩu đã băm
          (PBKDF2), kết nối được mã hóa (HTTPS) và môi trường bộ nhớ đệm cách ly cho từng máy chủ. Tuy nhiên, không có
          phương thức truyền tải nào qua Internet là an toàn 100%.
        </p>
      </Section>

      <Section number={6} title="Cookie">
        <p>
          FiveCache sử dụng cookie thiết yếu để duy trì phiên đã xác thực của bạn. Chúng tôi không sử dụng cookie theo
          dõi hoặc quảng cáo.
        </p>
      </Section>

      <Section number={7} title="Quyền của Bạn">
        <ul>
          <li>Truy cập, cập nhật hoặc xóa thông tin cá nhân của bạn.</li>
          <li>Yêu cầu xuất dữ liệu phân tích máy chủ của bạn.</li>
          <li>Từ chối nhận thông tin liên lạc quảng cáo bất cứ lúc nào.</li>
        </ul>
      </Section>

      <Section number={8} title="Thay đổi Chính sách này">
        <p>
          Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Việc tiếp tục sử dụng dịch vụ sau khi thay
          đổi đồng nghĩa với việc chấp nhận chính sách đã cập nhật.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-zinc-400 mb-3">Câu hỏi về quyền riêng tư?</p>
        <a
          href="mailto:privacy@fivecache.site"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-6 py-2 rounded-lg font-semibold transition-all"
        >
          <Mail className="h-4 w-4" />
          Liên hệ Nhóm Bảo mật
        </a>
      </div>
    </article>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center text-sm">
          {number}
        </span>
        <h3 className="text-lg font-semibold text-zinc-50 mt-1">{title}</h3>
      </div>
      <div className="ml-11 text-zinc-300 text-sm leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1">
        {children}
      </div>
    </section>
  )
}