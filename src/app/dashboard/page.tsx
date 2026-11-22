'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Server,
  Plus,
  Settings,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Zap,
  TrendingUp,
  HardDrive,
  Gauge,
  Globe,
  FileText,
  CalendarClock,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Progress } from '@/components/ui/progress'

type DashboardData = {
  servers: Array<{
    id: string
    serverId: string
    name: string
    domain: string
    blocked: boolean
    plan: string
  }>
  selected: { id: string; serverId: string; name: string } | null
  stats: {
    serverId: string
    name: string
    domain: string
    cacheUrl: string
    adhesiveKey?: string
    blocked: boolean
    resetDate: string | null
    plan: string
    totals: {
      requests: number
      bandwidthUsed: number
      bandwidthUsedFormatted: string
      storageUsed: number
      storageUsedFormatted: string
      cacheHitRate: number
      filesCached: number
    }
    statusCodes: {
      '2xx': number
      '3xx': number
      '4xx': number
      '5xx': number
      total: number
      percentages: { '2xx': number; '3xx': number; '4xx': number; '5xx': number }
    }
    topCountries: Array<{ id: string; country: string; code: string; requests: number }>
    topFiles: Array<{ id: string; file: string; requests: number }>
    monthlyStats: Array<{
      month: string
      requests: number
      bandwidth: number
      bandwidthFormatted: string
      hitRate: number
    }>
  } | null
}

type SlotsInfo = {
  servers: Array<{
    id: string
    serverId: string
    name: string
    domain: string
    serverIp: string | null
    serverPort: number | null
    plan: string
    blocked: boolean
    resetDate: string | null
    createdAt: string
  }>
  slots: { total: number; used: number; available: number }
  plan: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [slots, setSlots] = useState<SlotsInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [statsRes, slotsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/servers'),
      ])
      if (!statsRes.ok) throw new Error('Không thể lấy dữ liệu thống kê')
      const statsData = await statsRes.json()
      const slotsData = await slotsRes.json()
      setData(statsData)
      setSlots(slotsData)
      setError('')
    } catch (e) {
      console.error(e)
      setError('Không thể tải bảng điều khiển')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = () => {
    setRefreshing(true)
    loadData()
  }

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

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative">
        <AnimatedBackground />
        <SiteHeader />
        <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4">
          <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-zinc-300 mb-3">{error}</p>
          <Button
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600/20 bg-transparent"
            onClick={refresh}
          >
            Thử lại
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const user = null // chúng tôi không hiển thị tên người dùng ở header, nhưng truyền vào dashboard bên dưới

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />
      <main className="flex-1 relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          data={data}
          refreshing={refreshing}
          onRefresh={refresh}
        />

        {data && data.stats && (
          <DashboardContent
            data={data}
            slots={slots}
            onChangeServer={(serverId) =>
              fetch(`/api/dashboard/stats?serverId=${serverId}`).then(async (r) => {
                if (r.ok) {
                  const next = await r.json()
                  setData(next)
                }
              })
            }
            onRefresh={refresh}
            onShowAddServer={() => router.push('/#pricing')}
          />
        )}

        {data && data.servers.length === 0 && (
          <NoServersEmptyState onUpgrade={() => router.push('/#pricing')} />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

function DashboardHeader({
  data,
  refreshing,
  onRefresh,
}: {
  data: DashboardData | null
  refreshing: boolean
  onRefresh: () => void
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-2">
          Tổng quan
          {refreshing && <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />}
        </h1>
        <p className="text-zinc-400 mt-1">Chào mừng trở lại, quản lý các cache server của bạn.</p>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-transparent"
        disabled={refreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Làm mới dữ liệu
      </Button>
    </div>
  )
}

function DashboardContent({
  data,
  slots,
  onChangeServer,
  onRefresh,
  onShowAddServer,
}: {
  data: DashboardData
  slots: SlotsInfo | null
  onChangeServer: (serverId: string) => void
  onRefresh: () => void
  onShowAddServer: () => void
}) {
  const { stats, servers } = data
  if (!stats) return null

  return (
    <div className="space-y-8">
      <ServerSelector
        servers={servers}
        selected={data.selected}
        slots={slots}
        onChange={onChangeServer}
        onAddServer={onShowAddServer}
      />
      <StatsGrid stats={stats} />
      <CacheServerPanel stats={stats} onRefresh={onRefresh} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ResponseStatusPanel stats={stats} />
        <CountriesPanel stats={stats} />
        <TopFilesPanel stats={stats} />
      </div>
      <MonthlyUsageTable stats={stats} />
    </div>
  )
}

function ServerSelector({
  servers,
  selected,
  slots,
  onChange,
  onAddServer,
}: {
  servers: DashboardData['servers']
  selected: DashboardData['selected']
  slots: SlotsInfo | null
  onChange: (serverId: string) => void
  onAddServer: () => void
}) {
  const [open, setOpen] = useState(false)
  const available = slots?.slots.available ?? 0

  if (servers.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-between gap-2 h-10 px-4 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-zinc-900 transition-colors min-w-[240px]"
        >
          <Server className="h-4 w-4 mr-2" />
          <span className="flex-1 text-left truncate">
            {selected ? selected.name : 'Chọn Server'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-20 overflow-hidden">
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase border-b border-zinc-800">
              Servers của bạn
            </div>
            {servers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChange(s.id)
                  setOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-zinc-800 ${
                  selected?.id === s.id ? 'bg-zinc-800' : ''
                }`}
              >
                <span className="truncate">{s.name}</span>
                {!s.blocked && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
              </button>
            ))}

            {available > 0 ? (
              <button
                onClick={() => {
                  onAddServer()
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center justify-between cursor-pointer text-yellow-500 hover:text-yellow-400 hover:bg-zinc-800 border-t border-zinc-800"
              >
                <span>Thêm Server mới</span>
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <div className="px-3 py-2 text-sm text-zinc-500 border-t border-zinc-800">
                Bạn không có slot nào khả dụng.
              </div>
            )}
          </div>
        )}
      </div>

      {slots && (
        <span className="text-xs text-zinc-500 ml-2">
          Đã dùng {slots.slots.used} / {slots.slots.total === 999 ? '∞' : slots.slots.total} slot
        </span>
      )}
    </div>
  )
}

function StatsGrid({ stats }: { stats: DashboardData['stats'] }) {
  if (!stats) return null
  const { totals } = stats
  const cards = [
    {
      icon: TrendingUp,
      label: 'Tổng số yêu cầu',
      value: totals.requests.toLocaleString(),
      hint: 'Tháng này',
      color: 'text-zinc-50',
    },
    {
      icon: Zap,
      label: 'Băng thông đã dùng',
      value: totals.bandwidthUsedFormatted,
      hint: 'Không giới hạn',
      color: 'text-zinc-50',
      progress: 0.42,
    },
    {
      icon: HardDrive,
      label: 'Dung lượng đã dùng',
      value: totals.storageUsedFormatted,
      hint: 'Không giới hạn',
      color: 'text-zinc-50',
      progress: 0.35,
    },
    {
      icon: Gauge,
      label: 'Tỷ lệ Cache Hit',
      value: `${Math.round(totals.cacheHitRate * 100)}%`,
      hint: `${totals.filesCached} file đã cache`,
      color: 'text-green-400',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className={`rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6 ${
              stats.blocked ? 'opacity-60' : ''
            }`}
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-zinc-400">{c.label}</span>
              <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            {'progress' in c && c.progress !== undefined && (
              <Progress value={c.progress * 100} className="h-2 mt-2 mb-2 bg-zinc-800" />
            )}
            <div className="text-xs text-zinc-400 mt-2">{c.hint}</div>
          </div>
        )
      })}
    </div>
  )
}

function CacheServerPanel({
  stats,
  onRefresh,
}: {
  stats: DashboardData['stats']
  onRefresh: () => void
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  if (!stats) return null

  const canClear = stats.plan === 'pro_plus' || stats.plan === 'custom_evarose'

  const copyUrl = () => {
    navigator.clipboard.writeText(stats.cacheUrl).then(() => {
      setCopied(true)
      toast({ title: 'Đã sao chép vào clipboard!' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const clearCache = async () => {
    setClearing(true)
    try {
      const res = await fetch(`/api/dashboard/clear-cache?serverId=${stats.serverId}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Không thể xóa cache',
          description: data.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Đã xóa cache',
          description: 'Cache và CDN đã được xóa hoàn tất.',
        })
        onRefresh()
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Cache Server của bạn</h2>
          <p className="text-sm text-zinc-400">
            Chi tiết và cấu hình cache server FiveM của bạn
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfigOpen(true)}
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-transparent"
        >
          <Settings className="h-4 w-4 mr-2" />
          Cấu hình
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* URL Cache Server */}
        <div>
          <p className="text-sm text-zinc-400 mb-1">URL Cache Server</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-100 text-sm font-mono truncate">
              {stats.cacheUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyUrl}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Sử dụng URL này trong cấu hình server FiveM của bạn, đảm bảo dùng HTTPS
          </p>
        </div>

        {/* Khóa chống dump (adhesive_cdnKey) tự động */}
        <div>
          <p className="text-sm text-zinc-400 mb-1">Khóa Chống Dump (adhesive_cdnKey tự động)</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-green-400 text-sm font-mono truncate">
              {stats.adhesiveKey || 'd8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b'}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const key = stats.adhesiveKey || 'd8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b'
                navigator.clipboard.writeText(`set adhesive_cdnKey "${key}"`).then(() => {
                  toast({ title: 'Đã copy set adhesive_cdnKey!' })
                })
              }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              title="Copy set adhesive_cdnKey"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Tự động sinh mã mã hóa cache chống dump file FiveM client
          </p>
        </div>
      </div>

      {/* Khung cấu hình server.cfg đầy đủ */}
      <div className="mt-6 p-4 rounded-xl border border-zinc-700/80 bg-zinc-950/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <p className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <span>📋 Mã dán vào server.cfg (Đầy đủ cả 2 dòng):</span>
          </p>
          <Button
            size="sm"
            onClick={() => {
              const key = stats.adhesiveKey || 'd8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b'
              const cfg = `# FiveCache CDN & Chống Dump FiveM
set adhesive_cdnKey "${key}"
fileserver_add ".*" "${stats.cacheUrl}"`
              navigator.clipboard.writeText(cfg).then(() => {
                toast({ title: 'Đã sao chép toàn bộ cấu hình server.cfg!' })
              })
            }}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold h-8 text-xs"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Sao chép toàn bộ server.cfg
          </Button>
        </div>
        <pre className="text-xs md:text-sm font-mono text-zinc-200 bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 overflow-x-auto whitespace-pre">
{`# FiveCache CDN & Chống Dump FiveM
set adhesive_cdnKey "${stats.adhesiveKey || 'd8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b'}"
fileserver_add ".*" "${stats.cacheUrl}"`}
        </pre>
      </div>

      {/* Quản lý cache */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-sm text-zinc-400 mb-2">Quản lý Cache</p>
        {canClear ? (
          <Button
            variant="outline"
            onClick={clearCache}
            disabled={clearing}
            className="border-red-600 text-red-400 hover:bg-red-600/20 bg-transparent"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {clearing ? 'Đang xóa Cache...' : 'Xóa Cache & Purge CDN'}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 bg-transparent"
            asChild
          >
            <Link href="/#pricing">
              <Zap className="h-4 w-4 mr-2" />
              Nâng cấp để Xóa Cache
            </Link>
          </Button>
        )}
        <p className="text-xs text-zinc-500 mt-1">
          Xóa cache và purge Cloudflare cache (mỗi ngày một lần)
        </p>
      </div>

      <ServerConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        serverId={stats.serverId}
        onSaved={onRefresh}
      />
    </div>
  )
}

function ServerConfigDialog({
  open,
  onOpenChange,
  serverId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: string
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [serverIp, setServerIp] = useState('')
  const [serverPort, setServerPort] = useState('')
  const [saving, setSaving] = useState(false)

  // Tải cấu hình hiện có khi mở dialog
  useEffect(() => {
    if (open && serverId) {
      fetch('/api/dashboard/servers').then(async (r) => {
        const data = await r.json()
        const s = data.servers?.find((srv: { serverId: string }) => srv.serverId === serverId)
        if (s) {
          setName(s.name || '')
          setServerIp(s.serverIp || '')
          setServerPort(s.serverPort ? String(s.serverPort) : '')
        }
      })
    }
  }, [open, serverId])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          name,
          serverIp,
          serverPort: serverPort ? Number(serverPort) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Lưu thất bại', description: data.error, variant: 'destructive' })
      } else {
        toast({
          title: 'Đã tạo cấu hình',
          description: data.message || 'Đã lưu cấu hình server FiveM thành công!',
        })
        onOpenChange(false)
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 flex items-center gap-2">
            <Settings className="h-5 w-5 text-yellow-400" />
            Cấu hình Server FiveM
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Thêm các dòng sau vào file server.cfg của server FiveM
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serverName" className="text-zinc-300">
              Tên Server
            </Label>
            <Input
              id="serverName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Server Roleplay của tôi"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverIp" className="text-zinc-300">
                IP Server
              </Label>
              <Input
                id="serverIp"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                placeholder="149.202.65.1"
                className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serverPort" className="text-zinc-300">
                Cổng Server
              </Label>
              <Input
                id="serverPort"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                placeholder="30120"
                className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>

          {/* Xem trước cấu hình được tạo */}
          {name && (
            <div className="mt-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-zinc-50 font-medium mb-2 text-sm">
                Đoạn mã server.cfg được tạo (Đầy đủ cả 2 dòng):
              </p>
              <pre className="text-green-400 text-xs sm:text-sm font-mono whitespace-pre-wrap break-all">
{`set adhesive_cdnKey "d8c47f9b2e1a3c5e7b0d8f6a4c2e1b9a7f5d3c1b0a8e6f4d2c0b8a6f4e2d0c8b"
fileserver_add ".*" "https://fivecachesite.vercel.app/files"`}
              </pre>
            </div>
          )}

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 font-medium mb-2 text-sm">Hướng dẫn cài đặt:</p>
            <ol className="text-zinc-300 text-sm space-y-1 list-decimal list-inside">
              <li>Sao chép cả 2 dòng cấu hình ở trên (gồm cả khóa chống dump và link CDN)</li>
              <li>Thêm vào file server.cfg của FiveM</li>
              <li>Khởi động lại server FiveM</li>
              <li>Các file cache của bạn sẽ được mã hóa chống dump và phân phối qua CDN tốc độ cao!</li>
            </ol>
          </div>

          <DialogFooter className="flex justify-end gap-2">
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
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Đang lưu...' : 'Tạo cấu hình'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResponseStatusPanel({ stats }: { stats: DashboardData['stats'] }) {
  if (!stats) return null
  const { statusCodes } = stats
  const bars = [
    { label: '2xx Thành công', value: statusCodes['2xx'], pct: statusCodes.percentages['2xx'], color: 'bg-green-500' },
    { label: '3xx Chuyển hướng', value: statusCodes['3xx'], pct: statusCodes.percentages['3xx'], color: 'bg-blue-500' },
    { label: '4xx Lỗi Client', value: statusCodes['4xx'], pct: statusCodes.percentages['4xx'], color: 'bg-yellow-500' },
    { label: '5xx Lỗi Server', value: statusCodes['5xx'], pct: statusCodes.percentages['5xx'], color: 'bg-red-500' },
  ]

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-zinc-50 mb-1">Trạng thái Phản hồi</h3>
      <p className="text-xs text-zinc-400 mb-4">Phân bố trạng thái phản hồi HTTP</p>
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-300">{b.label}</span>
              <span className="text-zinc-400">
                {b.value.toLocaleString()} ({b.pct}%)
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${b.color} transition-all duration-500`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CountriesPanel({ stats }: { stats: DashboardData['stats'] }) {
  if (!stats) return null
  const countries = stats.topCountries
  const max = countries[0]?.requests || 1

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-zinc-50 mb-1 flex items-center gap-2">
        <Globe className="h-4 w-4 text-yellow-400" />
        Quốc gia
      </h3>
      <p className="text-xs text-zinc-400 mb-4">Các quốc gia truy cập cache nhiều nhất</p>
      {countries.length === 0 ? (
        <p className="text-center text-zinc-500 py-4 text-sm">Không có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {countries.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {c.code}
                </span>
                <span className="text-sm text-zinc-400 truncate">{c.country}</span>
              </div>
              <span className="text-sm font-bold text-zinc-50 shrink-0">
                {c.requests.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TopFilesPanel({ stats }: { stats: DashboardData['stats'] }) {
  if (!stats) return null
  const files = stats.topFiles

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-zinc-50 mb-1 flex items-center gap-2">
        <FileText className="h-4 w-4 text-yellow-400" />
        File hàng đầu
      </h3>
      <p className="text-xs text-zinc-400 mb-4">Các file được yêu cầu nhiều nhất</p>
      {files.length === 0 ? (
        <p className="text-center text-zinc-500 py-4 text-sm">Không có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-400 truncate min-w-0 font-mono">{f.file}</span>
              <span className="text-sm font-bold text-zinc-50 shrink-0">
                {f.requests.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MonthlyUsageTable({ stats }: { stats: DashboardData['stats'] }) {
  if (!stats) return null
  const months = stats.monthlyStats

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-zinc-50 mb-1 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-yellow-400" />
        Lịch sử sử dụng hàng tháng
      </h3>
      <p className="text-xs text-zinc-400 mb-4">
        Yêu cầu và băng thông trong {months.length} tháng qua
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="py-2 pr-4 font-medium text-zinc-400">Tháng</th>
              <th className="py-2 pr-4 font-medium text-zinc-400 text-right">Yêu cầu</th>
              <th className="py-2 pr-4 font-medium text-zinc-400 text-right">Băng thông</th>
              <th className="py-2 font-medium text-zinc-400 text-right">Tỷ lệ Hit</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => (
              <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                <td className="py-2 pr-4 text-zinc-300">
                  {new Date(m.month).toLocaleDateString('vi-VN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2 pr-4 text-zinc-50 text-right font-mono">
                  {m.requests.toLocaleString()}
                </td>
                <td className="py-2 pr-4 text-zinc-50 text-right font-mono">
                  {m.bandwidthFormatted}
                </td>
                <td className="py-2 text-green-400 text-right font-mono">
                  {(m.hitRate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NoServersEmptyState({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
      <div className="inline-flex p-3 rounded-xl bg-red-500/20 mb-4">
        <ShieldAlert className="h-6 w-6 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-50 mb-2">Không có Slot khả dụng</h2>
      <p className="text-zinc-300 text-sm mb-4 max-w-md mx-auto">
        Bạn không có slot đăng ký miễn phí nào để cấu hình server FiveM mới.
      </p>
      <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
        Vui lòng truy cập trang bảng giá để mua thêm gói, hoặc quản lý các server hiện có để giải phóng slot.
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          onClick={onUpgrade}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Xem Bảng giá
        </Button>
        <Link href="/legal">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
            Quản lý Servers
          </Button>
        </Link>
      </div>
    </div>
  )
}