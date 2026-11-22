'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import type { PricingPlan } from '@/lib/plans'
import { useLanguage } from '@/context/language-context'

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const { t } = useLanguage()
  const { id, price, currency, accentGradient, highlight } = plan

  // Map to localized plan info if available
  const planKey = id === 'hobby' ? 'hobby' : id === 'pro_plus' ? 'proPlus' : 'enterprise'
  const localizedPlan = t.pricing.plans[planKey]

  const name = localizedPlan?.name || plan.name
  const description = localizedPlan?.description || plan.description
  const features = localizedPlan?.features || plan.features
  const period = t.pricing.period || plan.period
  const ctaLabel = highlight
    ? t.pricing.ctaStart
    : id === 'custom_evarose'
    ? t.pricing.ctaContact
    : t.pricing.ctaStart

  return (
    <div
      className={`relative rounded-xl border p-8 backdrop-blur-sm transition-all duration-500 ${
        highlight
          ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent shadow-2xl shadow-yellow-500/20 hover:shadow-yellow-500/40 scale-[1.02]'
          : 'border-zinc-800/50 bg-zinc-900/40 hover:border-yellow-500/30 hover:bg-zinc-900/60'
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
            {t.pricing.mostPopular}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center`}
        >
          <span className="text-black font-bold text-sm">{name.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-semibold text-white">{name}</h3>
      </div>

      <div className="flex items-baseline justify-center gap-1 mb-4">
        <span className="text-4xl font-bold text-white">{currency}</span>
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-zinc-400 text-sm">{period}</span>
      </div>

      <p className="text-zinc-400 text-sm leading-relaxed mb-6 text-center min-h-[3rem]">
        {description}
      </p>

      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 animate-slideInLeft">
            <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-300 text-sm">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={`block w-full text-center rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
          highlight
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
            : 'border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

