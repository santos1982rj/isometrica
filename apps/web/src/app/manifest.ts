import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Isométrica',
    short_name: 'Isométrica',
    description: 'Plataforma inteligente de evolução acadêmica para Engenharia',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9fb',
    theme_color: '#1a2e3c',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
