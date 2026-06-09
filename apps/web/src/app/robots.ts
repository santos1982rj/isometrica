import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/professor/'],
    },
    sitemap: 'https://isometrica.eng.br/sitemap.xml',
  }
}
