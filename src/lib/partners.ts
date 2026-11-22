// Partner logos for FiveCache - using styled brand tiles
export type Partner = {
  id: string
  name: string
  // Tailwind gradient for the logo tile
  gradient: string
  // Short display name
  short: string
}

export const PARTNERS: Partner[] = [
  { id: 'lemon', name: 'Lemon Network', short: 'LEMON', gradient: 'from-yellow-300 to-lime-500' },
  { id: 'gamehosting', name: 'GameHosting', short: 'GH', gradient: 'from-blue-400 to-cyan-500' },
  { id: 'renewed', name: 'Renewed', short: 'R', gradient: 'from-orange-400 to-red-500' },
  { id: 'overextended', name: 'Overextended', short: 'OX', gradient: 'from-fuchsia-400 to-pink-500' },
  { id: 'devhub', name: 'DevHub', short: 'DEV', gradient: 'from-emerald-400 to-teal-500' },
]
