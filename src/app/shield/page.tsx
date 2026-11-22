'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Shield,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Ban,
  Activity,
  Globe,
  Copy,
  Check,
  Server,
  CalendarClock,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Zap,
  ArrowLeft,
  Eye,
  X,
  Crown,
} from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ShieldItem = {
  id: string
  code: string
  name: string
  domain: string
  cacheUrl: string
  originHost: string
  originPort: number
  protocol: string
  status: 'active' | 'suspended' | 'cancelled'
  pricePerMonth: number
  expiresAt: string
  autoRenew: boolean
  totalRequests: number
  blockedRequests: number
  bandwidthServed: number
  uniquePlayers: number
  createdAt: string
}

type ListResponse = {
  balance: number
  shields: ShieldItem[]
  stats: {
    totalShields: number
    activeShields: number
    totalMonthlyCost: number
    totalRequests: number
    totalBlocked: number
  }
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ'
}

function formatBytes(n: number): string {
  if (n === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(i < 2 ? 0 : 1)} ${sizes[i]}`
}

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

export default function ShieldPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/shield/list')
      if (!res.ok) throw new Error('Failed to load shields')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !authChecked) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 relative">
        <AnimatedBackground />
        <SiteHeader />
        <div className="flex items-center justify-center h-[60vh] relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-2">
              <Shield className="h-7 w-7 text-yellow-400" />
              FiveCache Shield CDN
            </h1>
            <p className="text-zinc-400 mt-1">
              Anti-dump CDN cho FiveM server — files dump về không thể mở vì thiếu adhesive_cdnKey
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTopupOpen(true)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              disabled={!data || data.balance < 299_000}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo Shield mới
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        {data && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <StatCard
              icon={Wallet}
              label="Số dư tài khoản"
              value={formatVnd(data.balance)}
              color="text-yellow-400"
            />
            <StatCard
              icon={TrendingDown}
              label="Chi phí tháng"
              value={formatVnd(data.stats.totalMonthlyCost)}
              color="text-red-400"
              hint={`${data.stats.activeShields} shield active`}
            />
            <StatCard
              icon={Server}
              label="Shield servers"
              value={`${data.stats.activeShields} / ${data.stats.totalShields}`}
              color="text-zinc-50"
              hint="Đang sử dụng"
            />
            <StatCard
              icon={Ban}
              label="Blocked requests"
              value={data.stats.totalBlocked.toLocaleString()}
              color="text-red-400"
              hint={`${data.stats.totalRequests.toLocaleString()} total`}
            />
          </div>
        )}

        {/* Shields list */}
        {data && data.shields.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          data && (
            <div className="space-y-4">
              {data.shields.map((shield) => (
                <ShieldCard key={shield.id} shield={shield} onChanged={loadData} />
              ))}
            </div>
          )
        )}

        {/* Educational section */}
        <div className="mt-12 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-2 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Cơ chế anti-dump 4 lớp
          </h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-300 mt-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">1.</span>
              <div>
                <strong className="text-zinc-50">User-Agent check</strong> — chỉ serve file cho
                client có header CitizenFX, block curl/wget/browser.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">2.</span>
              <div>
                <strong className="text-zinc-50">Shield status</strong> — shield phải active và
                chưa hết hạn, nếu không trả 403.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">3.</span>
              <div>
                <strong className="text-zinc-50">Token validation</strong> — FXServer gọi{' '}
                <code className="text-yellow-400">/api/shield/token</code> khi player join, client
                phải đính kèm token 5 phút TTL.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">4.</span>
              <div>
                <strong className="text-zinc-50">Content hash + XOR obfuscation</strong> — file
                được XOR với adhesive_cdnKey trước khi gửi, dump về là bytecode rác không decompile
                được.
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Lưu ý: anti-dump 100% là bất khả thi. Layer này làm cho việc dump trở nên phi thực tế,
            không phải bất khả thi về mặt lý thuyết.
          </p>
        </div>
      </main>

      <SiteFooter />

      <CreateShieldDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        balance={data?.balance ?? 0}
        onCreated={(newShield) => {
          setCreateOpen(false)
          toast({
            title: 'Shield created!',
            description: `Shield "${newShield.name}" đang active. Copy 2 dòng config vào server.cfg.`,
          })
          loadData()
        }}
      />

      <TopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onToppedUp={(newBalance) => {
          setTopupOpen(false)
          toast({
            title: 'Nạp tiền thành công',
            description: `Số dư mới: ${formatVnd(newBalance)}`,
          })
          loadData()
        }}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = 'text-zinc-50',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  color?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {hint && <div className="text-xs text-zinc-500 mt-1">{hint}</div>}
    </div>
  )
}

function ShieldCard({
  shield,
  onChanged,
}: {
  shield: ShieldItem
  onChanged: () => void
}) {
  const { toast } = useToast()
  const [showConfig, setShowConfig] = useState(false)
  const [copied, setCopied] = useState<'adhesive' | 'fileserver' | null>(null)

  const copyText = (key: 'adhesive' | 'fileserver', text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const renew = async () => {
    const res = await fetch(`/api/shield/${shield.id}/renew`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      toast({
        title: 'Gia hạn thất bại',
        description: data.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Gia hạn thành công',
        description: `Shield đã được gia hạn 30 ngày. Số dư: ${formatVnd(data.newBalance)}`,
      })
      onChanged()
    }
  }

  const cancel = async () => {
    if (!confirm(`Hủy shield "${shield.name}"? Data sẽ được giữ nhưng file không serve nữa.`)) return
    const res = await fetch(`/api/shield/${shield.id}/cancel`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Hủy thất bại', description: data.error, variant: 'destructive' })
    } else {
      toast({
        title: 'Shield đã hủy',
        description: `Refund: ${formatVnd(data.newBalance - 0)}đ. Data được giữ.`,
      })
      onChanged()
    }
  }

  const adhesiveLine = `set adhesive_cdnKey "<hidden>"` // shown in detail page
  const fileserverLine = `fileserver_add "*" "${shield.cacheUrl}"`

  const statusColor =
    shield.status === 'active'
      ? 'bg-green-500/10 text-green-400 border-green-500/30'
      : shield.status === 'suspended'
        ? 'bg-red-500/10 text-red-400 border-red-500/30'
        : 'bg-zinc-700/30 text-zinc-400 border-zinc-700'

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-50 truncate">{shield.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor} uppercase`}>
                {shield.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {shield.domain}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                {shield.protocol}://{shield.originHost}:{shield.originPort}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {daysLeft(shield.expiresAt)} ngày left
              </span>
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <div className="text-zinc-50 font-bold">{shield.totalRequests.toLocaleString()}</div>
            <div className="text-zinc-500">requests</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">{shield.blockedRequests.toLocaleString()}</div>
            <div className="text-zinc-500">blocked</div>
          </div>
          <div className="text-center">
            <div className="text-zinc-50 font-bold">{formatBytes(shield.bandwidthServed)}</div>
            <div className="text-zinc-500">served</div>
          </div>
          <div className="text-center">
            <div className="text-zinc-50 font-bold">{shield.uniquePlayers.toLocaleString()}</div>
            <div className="text-zinc-500">players</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig((s) => !s)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
          >
            <Eye className="h-4 w-4 mr-1" />
            Config
          </Button>
          {shield.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={renew}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Gia hạn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancel}
                className="border-red-600 text-red-400 hover:bg-red-600/20 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hủy
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Config reveal */}
      {showConfig && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
          <div>
            <Label className="text-zinc-400 text-xs mb-1 block">
              1. adhesive_cdnKey (dán vào cuối server.cfg)
            </Label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <code className="text-green-400 text-xs font-mono flex-1 truncate">
                set adhesive_cdnKey "••••••••••••••••••••••••••••••••"
              </code>
              <Link
                href={`/api/shield/${shield.id}/config`}
                target="_blank"
                className="text-yellow-400 hover:text-yellow-300"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Key bị ẩn để tránh leak. Click vào icon external để xem raw.
            </p>
          </div>

          <div>
            <Label className="text-zinc-400 text-xs mb-1 block">
              2. fileserver_add (dán vào cuối server.cfg)
            </Label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <code className="text-green-400 text-xs font-mono flex-1 truncate">
                {fileserverLine}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyText('fileserver', fileserverLine)}
                className="h-6 w-6 p-0"
              >
                {copied === 'fileserver' ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-zinc-300">
            <strong className="text-blue-400">Cách hoạt động:</strong> Khi player join, FXServer
            gọi <code className="text-yellow-400">POST /api/shield/token</code> với{' '}
            <code className="text-yellow-400">sharedSecret=adhesive_cdnKey</code> + player IP +
            license. Client nhận token 5-phút TTL, dùng để fetch{' '}
            <code className="text-yellow-400">{shield.cacheUrl}/{'<file>'}?token=...&amp;hash=...</code>.
            CDN verify 4 lớp rồi trả file đã XOR-obfuscate.
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-12 text-center">
      <Shield className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-zinc-50 mb-2">Chưa có Shield nào</h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Tạo shield CDN đầu tiên cho FiveM server của bạn. Anti-dump, anti-bot, anti-leech với giá{' '}
        <strong className="text-yellow-400">299.000đ/tháng</strong>.
      </p>
      <Button
        onClick={onCreate}
        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
      >
        <Plus className="h-4 w-4 mr-2" />
        Tạo Shield đầu tiên
      </Button>
    </div>
  )
}

function CreateShieldDialog({
  open,
  onOpenChange,
  balance,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  onCreated: (shield: {
    id: string
    code: string
    name: string
    domain: string
    cacheUrl: string
    adhesiveKey: string
  }) => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [originHost, setOriginHost] = useState('')
  const [originPort, setOriginPort] = useState('30120')
  const [protocol, setProtocol] = useState<'http' | 'https'>('http')
  const [loading, setLoading] = useState(false)

  // Auto-slug code from name
  useEffect(() => {
    if (name && !code) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 12)
      setCode(slug)
    }
  }, [name, code])

  const insufficient = balance < 299_000

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/shield/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          originHost,
          originPort: Number(originPort),
          protocol,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Tạo thất bại', description: data.error, variant: 'destructive' })
        return
      }
      onCreated(data.shield)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            Tạo Shield mới
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Anti-dump CDN cho FiveM server
          </DialogDescription>
        </DialogHeader>

        {insufficient && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-2 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              Số dư không đủ. Cần <strong>299.000đ</strong>, bạn có{' '}
              <strong>{formatVnd(balance)}</strong>. Vui lòng nạp tiền trước.
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Server Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SharkCITY"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-zinc-300">
              Code (subdomain)
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="sharkcity"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100 font-mono"
              required
              minLength={3}
            />
            <p className="text-xs text-zinc-500">
              Sẽ tạo URL: <code className="text-yellow-400">{code || 'sharkcity'}.fivecachesite.vercel.app</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originHost" className="text-zinc-300">
              Origin host (IP hoặc domain FXServer)
            </Label>
            <Input
              id="originHost"
              value={originHost}
              onChange={(e) => setOriginHost(e.target.value)}
              placeholder="149.202.65.1"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="originPort" className="text-zinc-300">
                Port
              </Label>
              <Input
                id="originPort"
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                placeholder="30120"
                className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Protocol</Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setProtocol('http')}
                  className={`flex-1 h-10 rounded-lg text-xs font-medium ${
                    protocol === 'http'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  http
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('https')}
                  className={`flex-1 h-10 rounded-lg text-xs font-medium ${
                    protocol === 'https'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  https
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Phí / 30 ngày</span>
              <span className="text-yellow-400 font-bold">299.000đ</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Số dư sau khi tạo</span>
              <span className={insufficient ? 'text-red-400' : 'text-green-400'}>
                {formatVnd(Math.max(0, balance - 299_000))}
              </span>
            </div>
            <p className="mt-2 text-zinc-500">
              Tự động gia hạn mỗi 30 ngày, trừ tiền từ balance. Hết tiền → shield suspended nhưng
              data được giữ.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || insufficient}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Đang tạo...' : '+ Tạo server'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TopupDialog({
  open,
  onOpenChange,
  onToppedUp,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onToppedUp: (newBalance: number) => void
}) {
  const { toast } = useToast()
  const [amount, setAmount] = useState('1000000')
  const [loading, setLoading] = useState(false)

  const presets = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/shield/topup-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Nạp thất bại', description: data.error, variant: 'destructive' })
        return
      }
      onToppedUp(data.newBalance)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-yellow-400" />
            Nạp tiền vào tài khoản
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Demo: tiền được cộng ngay lập tức. Production sẽ kết nối VNPay/MoMo/Stripe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-300">
              Số tiền (VND)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000000"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              required
              min={10000}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
              >
                {formatVnd(p)}
              </button>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Nạp {formatVnd(Number(amount) || 0)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
