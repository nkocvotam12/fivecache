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
      if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats')
      const statsData = await statsRes.json()
      const slotsData = await slotsRes.json()
      setData(statsData)
      setSlots(slotsData)
      setError('')
    } catch (e) {
      console.error(e)
      setError('Failed to load dashboard')
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
            Try Again
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const user = null // we don't show user name in header, but pass to dashboard below

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
          Dashboard
          {refreshing && <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />}
        </h1>
        <p className="text-zinc-400 mt-1">Welcome back, manage your cache servers.</p>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-transparent"
        disabled={refreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh Data
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
      {/* Server selector + slot info */}
      <ServerSelector
        servers={servers}
        selected={data.selected}
        slots={slots}
        onChange={onChangeServer}
        onAddServer={onShowAddServer}
      />

      {/* Stats cards */}
      <StatsGrid stats={stats} />

      {/* Cache server details */}
      <CacheServerPanel stats={stats} onRefresh={onRefresh} />

      {/* Response status + Countries + Top files */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ResponseStatusPanel stats={stats} />
        <CountriesPanel stats={stats} />
        <TopFilesPanel stats={stats} />
      </div>

      {/* Monthly usage history */}
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
            {selected ? selected.name : 'Select Server'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-20 overflow-hidden">
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase border-b border-zinc-800">
              Your Servers
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
                <span>Add New Server</span>
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <div className="px-3 py-2 text-sm text-zinc-500 border-t border-zinc-800">
                You do not have any slots available.
              </div>
            )}
          </div>
        )}
      </div>

      {slots && (
        <span className="text-xs text-zinc-500 ml-2">
          {slots.slots.used} / {slots.slots.total === 999 ? '∞' : slots.slots.total} slots used
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
      label: 'Total Requests',
      value: totals.requests.toLocaleString(),
      hint: 'This month',
      color: 'text-zinc-50',
    },
    {
      icon: Zap,
      label: 'Bandwidth Used',
      value: totals.bandwidthUsedFormatted,
      hint: 'Unlimited',
      color: 'text-zinc-50',
      progress: 0.42,
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: totals.storageUsedFormatted,
      hint: 'Unlimited',
      color: 'text-zinc-50',
      progress: 0.35,
    },
    {
      icon: Gauge,
      label: 'Cache Hit Rate',
      value: `${Math.round(totals.cacheHitRate * 100)}%`,
      hint: `${totals.filesCached} files cached`,
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
      toast({ title: 'Copied to clipboard!' })
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
          title: 'Cannot clear cache',
          description: data.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Cache cleared',
          description: 'Cache and CDN purge complete.',
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
          <h2 className="text-lg font-semibold text-zinc-50">Your Cache Server</h2>
          <p className="text-sm text-zinc-400">
            Your FiveM cache server details and configuration
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfigOpen(true)}
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-transparent"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cache Server URL */}
        <div>
          <p className="text-sm text-zinc-400 mb-1">Cache Server URL</p>
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
            Use this URL in your FiveM server configuration, make sure to use HTTPS
          </p>
        </div>

        {/* Server Domain */}
        <div>
          <p className="text-sm text-zinc-400 mb-1">Server Domain</p>
          <code className="block px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-100 text-sm font-mono truncate mt-1">
            {stats.domain}
          </code>
        </div>
      </div>

      {/* Cache management */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-sm text-zinc-400 mb-2">Cache Management</p>
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
            {clearing ? 'Clearing Cache...' : 'Clear Cache & Purge CDN'}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 bg-transparent"
            asChild
          >
            <Link href="/#pricing">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Clear Cache
            </Link>
          </Button>
        )}
        <p className="text-xs text-zinc-500 mt-1">
          Deletes cache and purges Cloudflare cache (once per day)
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

  // Load existing config when dialog opens
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
        toast({ title: 'Save failed', description: data.error, variant: 'destructive' })
      } else {
        toast({
          title: 'Configuration Generated',
          description: data.message || 'FiveM server configuration saved successfully!',
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
            FiveM Server Configuration
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add these lines to your FiveM server.cfg
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serverName" className="text-zinc-300">
              Server Name
            </Label>
            <Input
              id="serverName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Roleplay Server"
              className="bg-zinc-800/60 border-zinc-700 text-zinc-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverIp" className="text-zinc-300">
                Server IP
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
                Server Port
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

          {/* Generated config preview */}
          {name && (
            <div className="mt-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-zinc-50 font-medium mb-2 text-sm">
                Generated server.cfg snippet:
              </p>
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all">
                {`fileserver_add ".*" "https://${serverId}.fivecache.site/files"`}
              </pre>
            </div>
          )}

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 font-medium mb-2 text-sm">Setup Instructions:</p>
            <ol className="text-zinc-300 text-sm space-y-1 list-decimal list-inside">
              <li>Copy the fileserver line above</li>
              <li>Add it to your FiveM server.cfg file</li>
              <li>Restart your FiveM server</li>
              <li>Your cache files will now be served through our global CDN!</li>
            </ol>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              Cancel
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
              {saving ? 'Saving...' : 'Generate Configuration'}
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
    { label: '2xx Success', value: statusCodes['2xx'], pct: statusCodes.percentages['2xx'], color: 'bg-green-500' },
    { label: '3xx Redirect', value: statusCodes['3xx'], pct: statusCodes.percentages['3xx'], color: 'bg-blue-500' },
    { label: '4xx Client Error', value: statusCodes['4xx'], pct: statusCodes.percentages['4xx'], color: 'bg-yellow-500' },
    { label: '5xx Server Error', value: statusCodes['5xx'], pct: statusCodes.percentages['5xx'], color: 'bg-red-500' },
  ]

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-zinc-50 mb-1">Response Status</h3>
      <p className="text-xs text-zinc-400 mb-4">HTTP response status distribution</p>
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
        Countries
      </h3>
      <p className="text-xs text-zinc-400 mb-4">Top countries accessing your cache</p>
      {countries.length === 0 ? (
        <p className="text-center text-zinc-500 py-4 text-sm">No data available</p>
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
        Top Files
      </h3>
      <p className="text-xs text-zinc-400 mb-4">Most requested files</p>
      {files.length === 0 ? (
        <p className="text-center text-zinc-500 py-4 text-sm">No data available</p>
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
        Monthly Usage History
      </h3>
      <p className="text-xs text-zinc-400 mb-4">
        Requests and bandwidth for the last {months.length} months
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="py-2 pr-4 font-medium text-zinc-400">Month</th>
              <th className="py-2 pr-4 font-medium text-zinc-400 text-right">Requests</th>
              <th className="py-2 pr-4 font-medium text-zinc-400 text-right">Bandwidth</th>
              <th className="py-2 font-medium text-zinc-400 text-right">Hit Rate</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => (
              <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                <td className="py-2 pr-4 text-zinc-300">
                  {new Date(m.month).toLocaleDateString('en-US', {
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
      <h2 className="text-lg font-semibold text-zinc-50 mb-2">No Available Slots</h2>
      <p className="text-zinc-300 text-sm mb-4 max-w-md mx-auto">
        You don&apos;t have any free subscription slots available to configure a new FiveM server.
      </p>
      <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
        Please navigate to the pricing page to purchase an additional plan, or manage your
        existing servers to free up a slot.
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          onClick={onUpgrade}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          View Pricing
        </Button>
        <Link href="/legal">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
            Manage Servers
          </Button>
        </Link>
      </div>
    </div>
  )
}
