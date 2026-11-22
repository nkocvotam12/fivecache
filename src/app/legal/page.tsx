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
              Back to Home
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-black" fill="currentColor" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Legal Terms</h1>
            </div>

            <p className="text-zinc-400 mb-8">
              Please read these terms carefully before using FiveCache services.
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
                Terms of Service
              </button>
              <button
                onClick={() => setTab('privacy')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'privacy'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Privacy Policy
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
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Terms of Service – FiveCache</h2>
        <p className="text-sm text-zinc-500">Last updated: 19/09/2025</p>
      </header>

      <p className="text-zinc-300 leading-relaxed">
        Welcome to FiveCache (fivecachesite.vercel.app). By using our services, you agree to the following
        Terms of Service. Please read them carefully.
      </p>

      <Section number={1} title="Service Provided">
        <p>
          FiveCache offers a file caching and content delivery service designed for FiveM servers
          and related applications.
        </p>
        <p>
          The service is provided &quot;as is,&quot; without warranties of uninterrupted
          availability or error-free operation.
        </p>
      </Section>

      <Section number={2} title="Acceptable Use">
        <ul>
          <li>
            You may not use FiveCache to distribute illegal content, copyrighted materials without
            authorization, or harmful software (malware, phishing, etc.).
          </li>
          <li>
            Abuse of the service (including denial-of-service, bypassing restrictions, or harmful
            activity towards third parties) is strictly prohibited.
          </li>
          <li>
            You are solely responsible for the content you cache, store, or distribute via
            FiveCache.
          </li>
        </ul>
      </Section>

      <Section number={3} title="Accounts and Access">
        <ul>
          <li>Certain features may require registration.</li>
          <li>You are responsible for keeping your credentials secure.</li>
          <li>
            FiveCache reserves the right to suspend or terminate access if suspicious or abusive
            activity is detected.
          </li>
        </ul>
      </Section>

      <Section number={4} title="Availability and Liability">
        <ul>
          <li>
            While we strive to provide continuous uptime, we do not guarantee 100% availability.
          </li>
          <li>
            FiveCache shall not be held liable for any loss of data, downtime, or damages
            resulting from the use of the service.
          </li>
        </ul>
      </Section>

      <Section number={5} title="Modifications">
        <p>
          We may update these Terms at any time. Continued use of the service after changes implies
          acceptance.
        </p>
      </Section>

      <Section number={6} title="Refund Policy">
        <p>All subscriptions to FiveCache are billed in advance.</p>
        <p>
          Refunds are generally not provided for partial subscription periods, unused time, or
          downgrades.
        </p>
        <p>
          A refund may only be issued in exceptional cases (e.g., duplicate payments, proven
          service malfunction for extended periods).
        </p>
        <p>
          If you believe you are eligible for a refund, you must contact our support team within 7
          days of the billing date.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-zinc-400 mb-3">Questions?</p>
        <p className="text-zinc-300 mb-4">
          If you have any questions about these terms, please contact us.
        </p>
        <a
          href="mailto:support@fivecachesite.vercel.app"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-6 py-2 rounded-lg font-semibold transition-all"
        >
          <Mail className="h-4 w-4" />
          Contact Support
        </a>
      </div>
    </article>
  )
}

function PrivacyPolicy() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Privacy Policy – FiveCache</h2>
        <p className="text-sm text-zinc-500">Last updated: 19/09/2025</p>
      </header>

      <p className="text-zinc-300 leading-relaxed">
        This Privacy Policy explains how FiveCache (&quot;we&quot;, &quot;us&quot;) collects, uses,
        and protects your information when you use our caching and content delivery service.
      </p>

      <Section number={1} title="Information We Collect">
        <ul>
          <li>
            <strong>Account information:</strong> name, email address, and hashed password when you
            register.
          </li>
          <li>
            <strong>Server configuration:</strong> the FiveM server name, IP, and port you provide
            for caching purposes.
          </li>
          <li>
            <strong>Usage data:</strong> request counts, bandwidth, cache hit rates, and analytical
            metrics used to display your dashboard.
          </li>
          <li>
            <strong>Log data:</strong> IP addresses, request timestamps, and HTTP status codes for
            security and abuse prevention.
          </li>
        </ul>
      </Section>

      <Section number={2} title="How We Use Your Information">
        <ul>
          <li>To operate, maintain, and improve the FiveCache service.</li>
          <li>To monitor cache performance and provide real-time analytics.</li>
          <li>To detect, prevent, and address technical issues, fraud, or abuse.</li>
          <li>To communicate with you about your account and important updates.</li>
        </ul>
      </Section>

      <Section number={3} title="Data Sharing">
        <p>
          We do not sell your personal information. Aggregate, anonymized metrics may be shared with
          partners or used in marketing materials. We may disclose information when required by law
          or to protect our rights and the safety of others.
        </p>
      </Section>

      <Section number={4} title="Data Retention">
        <p>
          We retain your account information for as long as your account is active. Analytics data
          is aggregated and retained for up to 24 months. You may request deletion of your account
          at any time by contacting support.
        </p>
      </Section>

      <Section number={5} title="Security">
        <p>
          We use industry-standard practices to protect your data, including hashed passwords
          (PBKDF2), encrypted connections (HTTPS), and isolated per-server cache environments.
          However, no method of transmission over the Internet is 100% secure.
        </p>
      </Section>

      <Section number={6} title="Cookies">
        <p>
          FiveCache uses essential cookies to maintain your authenticated session. We do not use
          tracking or advertising cookies.
        </p>
      </Section>

      <Section number={7} title="Your Rights">
        <ul>
          <li>Access, update, or delete your personal information.</li>
          <li>Request export of your server analytics data.</li>
          <li>Opt out of promotional communications at any time.</li>
        </ul>
      </Section>

      <Section number={8} title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Continued use of the service after
          changes implies acceptance of the updated policy.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-zinc-400 mb-3">Questions about privacy?</p>
        <a
          href="mailto:privacy@fivecachesite.vercel.app"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-6 py-2 rounded-lg font-semibold transition-all"
        >
          <Mail className="h-4 w-4" />
          Contact Privacy Team
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
