'use client'

import Link from 'next/link'
import { ArrowRight, Database, Activity, Zap, Server, Globe, BarChart3, Shield, Workflow, Layers, TrendingUp, Network, Copy, Check, FileText, Check as CheckIcon, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/language-context'

import { AnimatedBackground } from '@/components/site/animated-background'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PricingCard } from '@/components/site/pricing-card'
import { PartnerCarousel } from '@/components/site/partner-carousel'
import { CDNVisualization } from '@/components/site/cdn-visualization'
import { FEATURE_CARDS, SECONDARY_FEATURES, STAT_CARDS, HOW_IT_WORKS_STEPS, CDN_BENEFITS } from '@/lib/content'
import { PRICING_PLANS } from '@/lib/plans'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden">
      <AnimatedBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <Hero />

        {/* Features grid (3 large cards) */}
        <FeaturesSection />

        {/* Stats */}
        <StatsSection />

        {/* How it works (includes behind the scenes) */}
        <HowItWorks />

        {/* Pricing */}
        <PricingSection />

        {/* Partners */}
        <PartnersSection />

        {/* CTA */}
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  )
}

function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative z-10 py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          {/* Update badge */}
          <div className="inline-block mb-6">
            <Link
              className="flex w-auto items-center space-x-2 rounded-full bg-yellow-500/10 px-3 py-1.5 ring-1 ring-yellow-400/30 whitespace-pre hover:opacity-80 transition"
              href="/blog/multi-server-support"
            >
              <span className="w-fit rounded-full bg-yellow-400/30 px-2 py-0.5 text-[11px] sm:text-sm font-medium text-yellow-300">
                Update
              </span>
              <p className="text-xs sm:text-sm font-medium text-yellow-300">
                {t.hero.badge}
              </p>
              <ArrowRight className="ml-1 h-3 w-3 text-yellow-400" />
            </Link>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
            {t.hero.titlePrefix}
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-gradient">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-4xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-10 py-5 text-lg font-semibold rounded-xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
            >
              {t.hero.ctaGetStarted}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-yellow-400/50 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 px-8 py-5 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              {t.hero.ctaPricing}
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-4">{t.hero.guarantee}</p>
        </div>

        {/* Three feature cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {FEATURE_CARDS.map((card, idx) => (
            <FeatureCard key={idx} card={card} delay={idx * 0.2} />
          ))}
        </div>
      </div>
    </section>
  )
}

type FeatureCardProps = {
  card: (typeof FEATURE_CARDS)[number]
  delay: number
}

function FeatureCard({ card, delay }: FeatureCardProps) {
  const Icon = card.icon
  return (
    <div
      className="rounded-lg border text-card-foreground shadow-sm bg-zinc-900/40 border-zinc-800/50 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500 backdrop-blur-sm hover:bg-zinc-900/60"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex flex-col space-y-1.5 p-6 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors duration-300">
            <Icon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="font-semibold tracking-tight text-white text-lg group-hover:text-yellow-50 transition-colors">
            {card.title}
          </div>
        </div>
        <div className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
          {card.description}
        </div>
      </div>
      <div className="p-6 pt-0 relative z-10">
        {'logs' in card && card.logs ? (
          <div className="space-y-3">
            {card.logs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${delay + i * 0.3}s`, animationFillMode: 'both' }}
              >
                <div className={`w-2 h-2 rounded-full mt-2 animate-pulse ${log.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 font-mono">
                    [2023-12-16 14:23:45] {log.level}
                  </p>
                  <p className="text-sm text-zinc-300 mt-1">{log.msg}</p>
                  <p className="text-xs text-zinc-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : 'network' in card && card.network ? (
          <CDNVisualization />
        ) : null}
      </div>
    </div>
  )
}

function FeaturesSection() {
  const { t } = useLanguage()

  return (
    <section id="features" className="relative z-10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mb-2">
            {t.features.sectionBadge}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fadeInUp">
            {t.features.title}
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto animate-fadeInUp">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SECONDARY_FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="group rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm hover:border-yellow-500/30 hover:bg-zinc-900/60 transition-all duration-500"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors text-center text-sm">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { t } = useLanguage()
  const statLabels = [
    t.stats.filesServed,
    t.stats.activeServers,
    t.stats.edgeLocations,
    t.stats.avgResponse,
  ]

  return (
    <section className="relative z-10 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {STAT_CARDS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="text-center group animate-fadeInUp">
                <div className="flex justify-center mb-4">
                  <Icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
                  {statLabels[i] || stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const configLine = `fileserver_add ".*" "https://SERVER_ID.fivecache.site/files"`

  const copyConfig = () => {
    navigator.clipboard.writeText(configLine).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section id="how-it-works" className="relative z-10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mb-2">
            {t.howItWorks.sectionBadge}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fadeInUp">
            {t.howItWorks.title}
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto animate-fadeInUp">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Step 1: Config line */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h3 className="text-zinc-50 font-medium">{t.howItWorks.step1.title}</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-3">
              {t.howItWorks.step1.description}
            </p>
            <div className="flex items-center justify-between gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700 group">
              <code className="text-green-400 text-sm flex-1 font-mono overflow-x-auto whitespace-nowrap">
                {configLine}
              </code>
              <button
                onClick={copyConfig}
                className="ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center text-zinc-400 hover:text-yellow-400"
                aria-label="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              {t.howItWorks.step1.instruction}
            </p>
          </div>
        </div>

        {/* 3 steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={i}
                className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 text-center backdrop-blur-sm"
              >
                <div className="text-yellow-400 font-bold text-lg mb-3">Step {i + 1}</div>
                <div className="flex justify-center mb-4">
                  <Icon className="h-10 w-10 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>

        {/* Behind the scenes */}
        <BehindScenes />
      </div>
    </section>
  )
}

function BehindScenes() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Behind the Scenes</h3>
        <p className="text-zinc-400">Here&apos;s what happens when a player connects to your server</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intelligent Request Routing */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="text-blue-400 font-medium mb-3 flex items-center gap-2">
            <Network className="h-4 w-4" />
            Intelligent Request Routing
          </div>
          <ol className="text-zinc-300 text-sm space-y-2 list-decimal list-inside">
            <li>Player connects to your FiveM server and requests cache files</li>
            <li>FiveCache automatically routes the request to the nearest edge location</li>
            <li>Cache files are delivered at lightning speed thanks to Cloudflare CDN</li>
            <li>
              All file delivery is offloaded, so your main server never even sees that traffic, so
              it can stay focused only on gameplay.
            </li>
            <li>Real-time analytics track performance and optimize future requests</li>
          </ol>
        </div>

        {/* Benefits */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="text-green-400 font-medium mb-2 flex items-center gap-2">
            <CheckIcon className="h-4 w-4" />
            Benefits You&apos;ll See Immediately
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-zinc-300 text-sm">
            {CDN_BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2">
                <CheckIcon className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
            Learn more about how FiveM resource caching works here:{' '}
            <a
              href="https://docs.fivem.net/docs/game-stuff/resource-caching/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Official Cfx Resource Caching Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingSection() {
  const { t } = useLanguage()

  return (
    <section id="pricing" className="relative z-10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mb-2">
            {t.pricing.sectionBadge}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fadeInUp">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto animate-fadeInUp">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnersSection() {
  return (
    <section className="relative z-10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mb-2">
            Trusted by
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fadeInUp">
            Our Partners &amp; Collaborations
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto animate-fadeInUp">
            We work with the <span className="text-white font-medium">best FiveM communities</span>{' '}
            and hosting providers to deliver exceptional caching solutions.
          </p>
        </div>

        <div className="mx-auto max-w-6xl mb-16">
          <PartnerCarousel />
        </div>

        <div className="text-center animate-fadeInUp">
          <h3 className="text-2xl font-bold text-white mb-4">Interested in Partnership?</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            We&apos;re always looking for new partners to collaborate with. Whether you&apos;re a
            FiveM community, or developer, let&apos;s work together.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-3 rounded-lg font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all"
          >
            Contact Us for Partnership
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative z-10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fadeInUp">
          Start caching in 60 seconds
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto animate-fadeInUp">
          Join hundreds of FiveM servers already using FiveCache to deliver lightning-fast cache
          experiences.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-10 py-5 text-lg font-semibold rounded-xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fadeInUp"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}
