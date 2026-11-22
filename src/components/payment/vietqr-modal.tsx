'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Loader2, Copy, Check, QrCode, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface VietQRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAmount?: number
  planName?: string
  onSuccess?: (order: any) => void
}

const PRESET_AMOUNTS = [
  { label: '50.000đ', value: 50_000 },
  { label: '100.000đ', value: 100_000 },
  { label: '200.000đ', value: 200_000 },
  { label: '299.000đ (1T Shield VIP)', value: 299_000, highlight: true },
  { label: '500.000đ', value: 500_000 },
  { label: '1.000.000đ', value: 1_000_000 },
]

export function VietQRModal({
  open,
  onOpenChange,
  defaultAmount = 299_000,
  planName = 'Nạp số dư FiveCache Shield',
  onSuccess,
}: VietQRModalProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState<number>(defaultAmount)
  const [customInput, setCustomInput] = useState<string>(String(defaultAmount))
  const [loading, setLoading] = useState<boolean>(false)
  const [checking, setChecking] = useState<boolean>(false)
  const [order, setOrder] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [completed, setCompleted] = useState<boolean>(false)

  // Reset states when opening
  useEffect(() => {
    if (open) {
      setAmount(defaultAmount)
      setCustomInput(String(defaultAmount))
      setOrder(null)
      setCompleted(false)
      setLoading(false)
    }
  }, [open, defaultAmount])

  const copyText = (field: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({ title: 'Đã sao chép!', description: text })
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Create payment order
  const handleCreateOrder = async (orderAmount: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderAmount,
          note: planName,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo đơn hàng thanh toán')
      }

      setOrder(data.order)
    } catch (err: any) {
      toast({
        title: 'Lỗi tạo đơn',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Poll order status
  const checkOrderStatus = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/payment/check-order?orderId=${orderId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'COMPLETED' || data.order?.status === 'COMPLETED') {
          setCompleted(true)
          toast({
            title: '🎉 Thanh toán thành công!',
            description: `Đã ghi nhận thanh toán ${amount.toLocaleString('vi-VN')}đ.`,
          })
          if (onSuccess) {
            onSuccess(data.order)
          }
          return true
        }
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
    return false
  }, [amount, onSuccess, toast])

  // Polling loop when order is active and pending
  useEffect(() => {
    if (!order || completed || !open) return

    const interval = setInterval(async () => {
      const isDone = await checkOrderStatus(order.orderId)
      if (isDone) {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [order, completed, open, checkOrderStatus])

  const handleManualCheck = async () => {
    if (!order) return
    setChecking(true)
    const isDone = await checkOrderStatus(order.orderId)
    if (!isDone) {
      toast({
        title: 'Chưa nhận được giao dịch',
        description: 'Vui lòng hoàn tất chuyển khoản theo đúng nội dung và số tiền.',
      })
    }
    setChecking(false)
  }

  const handleSimulatePayment = async () => {
    if (!order) return
    setChecking(true)
    try {
      // Simulate webhook hit
      const res = await fetch('/api/payment/sepay-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: order.bankInfo.bankName,
          transactionDate: new Date().toISOString(),
          accountNumber: order.bankInfo.accountNumber,
          content: order.code,
          transferType: 'in',
          transferAmount: order.amount,
          referenceCode: `SIM_${Date.now()}`,
        }),
      })

      if (res.ok) {
        await checkOrderStatus(order.orderId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg w-full p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-yellow-400">
            <QrCode className="h-6 w-6 text-yellow-400" />
            Nạp tiền VietQR SePay tự động
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Quét mã QR chuyển khoản ngân hàng — Tự động duyệt và cộng số dư trong 3 giây.
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/40 animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Thanh toán thành công!</h3>
            <p className="text-sm text-zinc-300">
              Số tiền <span className="text-yellow-400 font-bold">{amount.toLocaleString('vi-VN')}đ</span> đã được nạp thành công vào hệ thống.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        ) : !order ? (
          /* Step 1: Select or enter amount */
          <div className="space-y-5 py-3">
            <div>
              <Label className="text-sm text-zinc-300 mb-2 block">Chọn gói hoặc số tiền muốn nạp:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setAmount(preset.value)
                      setCustomInput(String(preset.value))
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-left ${
                      amount === preset.value
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 ring-1 ring-yellow-400/50'
                        : preset.highlight
                        ? 'border-yellow-500/40 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div>{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-amount" className="text-sm text-zinc-300 mb-1.5 block">
                Hoặc nhập số tiền khác (VNĐ):
              </Label>
              <Input
                id="custom-amount"
                type="number"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value)
                  setAmount(Number(e.target.value) || 0)
                }}
                min={10000}
                step={10000}
                className="bg-zinc-900 border-zinc-700 text-white font-mono text-base"
                placeholder="299000"
              />
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>Số tiền thanh toán:</span>
              <span className="text-base font-bold text-yellow-400">{amount.toLocaleString('vi-VN')} đ</span>
            </div>

            <Button
              onClick={() => handleCreateOrder(amount)}
              disabled={loading || amount < 10000}
              className="w-full h-11 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold text-sm shadow-lg shadow-yellow-500/10"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Đang tạo mã VietQR...' : 'Tiếp tục tạo mã VietQR'}
            </Button>
          </div>
        ) : (
          /* Step 2: Show VietQR Code & Payment Info */
          <div className="space-y-4 py-2">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
              {/* QR Image */}
              <div className="bg-white p-2.5 rounded-lg shrink-0 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.qrUrl}
                  alt="VietQR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              {/* Bank Details */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div>
                  <span className="text-zinc-500 block">Ngân hàng:</span>
                  <span className="font-bold text-white text-sm">{order.bankInfo.bankName}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Số tài khoản:</span>
                  <div className="flex items-center justify-between bg-zinc-950 px-2 py-1.5 rounded border border-zinc-800">
                    <span className="font-mono font-bold text-yellow-400 text-sm">{order.bankInfo.accountNumber}</span>
                    <button
                      onClick={() => copyText('account', order.bankInfo.accountNumber)}
                      className="text-zinc-400 hover:text-white"
                      title="Sao chép"
                    >
                      {copiedField === 'account' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block">Chủ tài khoản:</span>
                  <span className="font-semibold text-zinc-200">{order.bankInfo.accountName}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Nội dung chuyển khoản (bắt buộc):</span>
                  <div className="flex items-center justify-between bg-yellow-500/10 px-2 py-1.5 rounded border border-yellow-500/30">
                    <span className="font-mono font-bold text-yellow-400 text-sm tracking-wider">{order.code}</span>
                    <button
                      onClick={() => copyText('code', order.code)}
                      className="text-yellow-400 hover:text-white"
                      title="Sao chép"
                    >
                      {copiedField === 'code' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block">Số tiền:</span>
                  <span className="font-bold text-white text-base">{order.amount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />
              <span>Hệ thống đang tự động lắng nghe giao dịch SePay...</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleManualCheck}
                disabled={checking}
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-9 bg-transparent"
              >
                {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-400" />}
                Tôi đã chuyển khoản (Kiểm tra ngay)
              </Button>

              <Button
                variant="ghost"
                onClick={handleSimulatePayment}
                className="w-full text-zinc-500 hover:text-yellow-400 text-[11px] h-7"
              >
                ⚡ Nhấn để kích hoạt thanh toán ngay (Demo Test)
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-zinc-800/80 pt-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
