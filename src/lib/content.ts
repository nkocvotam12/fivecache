'use client'

import { Database, Activity, Zap, Server, Globe, HardDrive, TrendingUp, BarChart3, Shield, Layers, Workflow, Network } from 'lucide-react'

// Centralized feature definitions used across landing + dashboard
export const FEATURE_CARDS = [
  {
    icon: Database,
    title: 'Cache File Management',
    description: 'Streamline your FiveM cache file management with integrated CDN tools.',
    logs: [
      { level: 'INFO', color: 'bg-blue-400', msg: 'Cache file uploaded successfully', time: '2s ago' },
      { level: 'SUCCESS', color: 'bg-green-400', msg: 'File distributed to 15 edge locations', time: '1m ago' },
    ],
  },
  {
    icon: Activity,
    title: 'Cache Performance Monitoring',
    description: 'Monitor cache hit rates and delivery performance in real-time.',
    logs: [
      { level: 'INFO', color: 'bg-blue-400', msg: 'Cache server started. Monitoring performance.', time: '1m ago' },
      { level: 'ACTION', color: 'bg-green-400', msg: 'Player downloaded cached resource.', time: '3m ago' },
    ],
  },
  {
    icon: Zap,
    title: 'Lightning-Fast CDN',
    description: 'Deliver FiveM cache files and content with blazing speed using our global CDN network.',
    network: true,
  },
] as const

export const SECONDARY_FEATURES = [
  {
    icon: Zap,
    title: 'Fast Content Delivery',
    description: 'Deliver FiveM cache files and resources quickly with a high-speed global CDN network.',
  },
  {
    icon: BarChart3,
    title: 'Seamless Cache Logging',
    description: 'Easily track and store cache access logs and delivery analytics for better insights.',
  },
  {
    icon: Server,
    title: 'Optimized for FiveM Servers',
    description: 'Specifically tailored to meet the caching needs of FiveM game servers and communities.',
  },
  {
    icon: Workflow,
    title: 'Simple Cache Integration',
    description: 'Set up and integrate FiveCache with your FiveM server using minimal configuration.',
  },
  {
    icon: Shield,
    title: 'Reliable Cache Performance',
    description: 'Ensure consistent and dependable cache delivery performance for your players.',
  },
  {
    icon: Layers,
    title: 'Scalable Cache Solution',
    description: 'Grow effortlessly with cache infrastructure designed for high-traffic FiveM servers.',
  },
] as const

export const STAT_CARDS = [
  { icon: Database, label: 'Cache Files Served', value: '2.5M+', color: 'text-yellow-400' },
  { icon: Server, label: 'Active FiveM Servers', value: '80+', color: 'text-yellow-400' },
  { icon: Globe, label: 'Global Edge Locations', value: '25+', color: 'text-yellow-400' },
  { icon: Activity, label: 'Avg Cache Response', value: '<15ms', color: 'text-yellow-400' },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    icon: Network,
    title: 'Add Configuration Line',
    description: 'Add this single line to your FiveM server.cfg file',
  },
  {
    icon: Server,
    title: 'Restart Server',
    description: 'Simply restart your FiveM server to activate the CDN integration. No additional configuration needed.',
  },
  {
    icon: TrendingUp,
    title: 'Automatic Caching',
    description: 'Your server assets are now served globally! Players download resources from the nearest edge location.',
  },
] as const

export const CDN_EDGES = [
  { name: 'US-East', x: 30, y: 40 },
  { name: 'EU-West', x: 55, y: 35 },
  { name: 'Asia', x: 75, y: 55 },
  { name: 'US-West', x: 18, y: 55 },
] as const

export const CDN_BENEFITS = [
  'Faster player connection times',
  'Reduced server bandwidth usage',
  'Global reach for international players',
  'Improved server performance',
  'Real-time delivery analytics',
  '99.9% uptime guarantee',
] as const
