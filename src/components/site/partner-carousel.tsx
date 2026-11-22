'use client'

import { PARTNERS } from '@/lib/partners'

export function PartnerCarousel() {
  // duplicate for seamless infinite scroll
  const items = [...PARTNERS, ...PARTNERS]

  return (
    <div className="overflow-hidden w-full">
      <div className="flex animate-scroll gap-12 w-max">
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex-shrink-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-4 py-2 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center`}
              >
                <span className="text-black font-extrabold text-sm tracking-tight">
                  {p.short}
                </span>
              </div>
              <span className="text-zinc-300 font-semibold text-lg whitespace-nowrap">
                {p.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
