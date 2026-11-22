'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight, ArrowLeft, Zap, Loader2, AlertCircle, Check } from 'lucide-react'
import { AnimatedBackground } from '@/components/site/animated-background'
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
  useRedirectIfAuthenticated()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, acceptTerms }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      toast({
        title: 'Account created!',
        description: 'Welcome to FiveCache. Redirecting to your dashboard...',
      })
      router.push('/dashboard')
      router.refresh()
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

          <h1 className="text-2xl font-bold text-zinc-50 text-center">Create your account</h1>
          <p className="text-zinc-400 mt-2 text-center">
            Start caching your FiveM files globally
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-md">
            <h2 className="text-xl text-zinc-50 mb-4">Sign up</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Create your FiveCache account to get started
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-2 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Email</label>
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

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Confirm your password</p>
              </div>

              <label className="flex items-start gap-3 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500/40"
                />
                <span className="text-sm text-zinc-400">
                  I agree to the{' '}
                  <Link
                    href="/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Terms of Service and Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold rounded-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex justify-center text-xs uppercase mt-6">
              <span className="bg-zinc-900 px-2 text-zinc-400">Prefer to sign in?</span>
            </div>

            <p className="text-center text-sm mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="pt-4 text-xs text-zinc-500 text-center">
            By creating an account, you agree to our{' '}
            <Link href="/legal" className="text-yellow-400 hover:text-yellow-300 underline">
              Terms of Service and Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
