import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.floodbar.id').replace(/\/$/, '')
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: baseUrl + '/artikel', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: baseUrl + '/order', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...articles.map((article) => ({
      url: baseUrl + '/artikel/' + article.slug,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
