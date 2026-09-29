import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.floodbar.id').replace(/\/$/, '')

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/artikel/', '/images/', '/_next/static/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}