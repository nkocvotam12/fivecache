'use client'

/**
 * FiveCache animated background:
 * - dark zinc gradient base
 * - animated moving grid
 * - two blurred glowing orbs (yellow)
 * - SVG gradient lines crossing the canvas
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(234, 179, 8, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* gradient lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(234, 179, 8)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="20%"
          x2="100%"
          y2="80%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          className="animate-pulse"
        />
        <line
          x1="100%"
          y1="30%"
          x2="0"
          y2="70%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </svg>
    </div>
  )
}
