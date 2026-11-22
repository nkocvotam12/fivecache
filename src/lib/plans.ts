// Pricing plans for FiveCache
export type PricingPlan = {
  id: string
  name: string
  price: number
  currency: string
  period: string
  description: string
  features: string[]
  highlight?: boolean
  accentGradient?: string
  ctaLabel: string
  slots?: number
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 10,
    currency: '€',
    period: '/month',
    description: 'For single FiveM servers getting started with caching.',
    features: [
      '50GB NVME SSD cache',
      'Unlimited traffic',
      '*.fivecachesite.vercel.app public domain',
      'Email support',
      'Basic real-time stats',
      '1 FiveM server slot',
    ],
    accentGradient: 'from-zinc-400 to-zinc-600',
    ctaLabel: 'Get Started',
    slots: 1,
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: 25,
    currency: '€',
    period: '/month',
    description: 'Serious communities or multi-server networks.',
    features: [
      'Unlimited NVME SSD cache',
      'Unlimited traffic',
      '*.fivecachesite.vercel.app public domain',
      '24/7 priority support',
      'Real-time stats',
      '5 FiveM server slots',
      'Cache clear & CDN purge',
    ],
    highlight: true,
    accentGradient: 'from-yellow-400 to-yellow-600',
    ctaLabel: 'Get Started',
    slots: 5,
  },
  {
    id: 'custom_evarose',
    name: 'Enterprise',
    price: 99,
    currency: '€',
    period: '/month',
    description: 'For large networks needing custom infrastructure.',
    features: [
      'Everything in Pro Plus',
      'Custom CDN configuration',
      'Dedicated edge locations',
      'API access & webhooks',
      'Custom domain support',
      'Unlimited server slots',
      'Dedicated account manager',
    ],
    accentGradient: 'from-purple-400 to-purple-600',
    ctaLabel: 'Contact Sales',
    slots: 999,
  },
]

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === id)
}
