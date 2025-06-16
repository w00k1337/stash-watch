import type { NextConfig } from 'next'

import { env } from '@/env/server'

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(env.STASH_BASE_URL).hostname
      },
      {
        protocol: 'https',
        hostname: 'stashdb.org'
      },
      {
        protocol: 'https',
        hostname: 'theporndb.net'
      }
    ]
  }
}

export default nextConfig
