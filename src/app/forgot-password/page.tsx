'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, ArrowLeft, Zap, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send reset link')
        return
      }
      setSent(true)
      toast({
        title: 'Reset link sent',
        description: 'Check your inbox for the password reset link.',
      })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>

        <div className="w-full max-w-md">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Zap className="h-7 w-7 text-black" fill="currentColor" />
              </div>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-zinc-50 text-center">Reset Password</h1>
          <p className="text-zinc-400 mt-2 text-center">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-md">
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-yellow-400 mx-auto" />
                <h2 className="text-xl font-bold text-zinc-50">Check Your Email</h2>
                <p className="text-zinc-400 text-sm">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="text-yellow-400 font-medium">{email}</p>
                <p className="text-zinc-400 text-sm">
                  Click the link in the email to reset your password and regain access to your
                  account.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold rounded-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-sm mt-4">
            <Link
              href="/login"
              className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
