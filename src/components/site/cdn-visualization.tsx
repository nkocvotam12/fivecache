'use client'

import { CDN_EDGES } from '@/lib/content'

/**
 * Animated CDN visualization - shows origin + edge nodes with pulsing connections
 */
export function CDNVisualization() {
  return (
    <div className="relative h-80 bg-zinc-800/30 rounded-lg overflow-hidden border border-zinc-700/30">
      <div className="relative w-full h-full p-4">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Lines from origin to edges */}
          {CDN_EDGES.map((e, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${e.x}%`}
              y2={`${e.y}%`}
              stroke="url(#connectionGradient)"
              strokeWidth="1.5"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>

        {/* Edge nodes */}
        {CDN_EDGES.map((e, i) => (
          <div
            key={e.name}
            className="absolute"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center border border-zinc-600">
                <span className="text-[10px] font-mono text-zinc-300">{e.name}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>
        ))}

        {/* Origin server in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/30">
              <span className="text-[10px] font-bold text-black text-center leading-tight">
                ORIGIN
              </span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-zinc-400 font-mono">
              CDN Active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
