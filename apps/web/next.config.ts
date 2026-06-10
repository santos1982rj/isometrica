import type { NextConfig } from 'next'

const API_BACKEND = process.env.API_BACKEND_URL ?? 'https://isometrica-api.onrender.com'

const nextConfig: NextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_BACKEND}/api/:path*`,
      },
    ]
  },
}

export default nextConfig