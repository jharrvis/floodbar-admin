import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.floodbar.id').replace(/\/$/, '')

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function articleUrl(slug: string) {
  return `${SITE_URL}/artikel/${slug}`
}

function absoluteUrl(url: string | null | undefined) {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

async function getArticle(slug: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await prisma.article.findUnique({
        where: { slug }
      })
    } catch (error) {
      if (attempt === 3) {
        console.error('Error fetching article:', error)
        return null
      }
      await wait(300 * attempt)
    }
  }
  return null
}

async function getSettings() {
  try {
    return await prisma.settings.findFirst()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article || !article.isPublished) {
    return {
      title: 'Artikel Tidak Ditemukan',
      robots: { index: false, follow: false }
    }
  }

  const title = article.seoTitle || article.title
  const description = article.metaDescription || article.excerpt
  const canonical = articleUrl(article.slug)
  const image = absoluteUrl(article.imageUrl)

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.author],
      images: image ? [{ url: image, alt: article.heroAlt || article.title }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : []
    }
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  const settings = await getSettings()

  if (!article || !article.isPublished) {
    notFound()
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canonical = articleUrl(article.slug)
  const image = absoluteUrl(article.imageUrl)
  const siteName = settings?.siteName || 'FloodBar.id'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      image: image ? [image] : undefined,
      datePublished: (article.publishedAt || article.createdAt).toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: { '@type': 'Organization', name: article.author || siteName },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: settings?.logoUrl ? { '@type': 'ImageObject', url: absoluteUrl(settings.logoUrl) } : undefined
      },
      mainEntityOfPage: canonical
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Artikel', item: `${SITE_URL}/artikel` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.siteName || 'FloodBar.id'}
                className="w-8 h-8 object-contain rounded"
                width={32}
                height={32}
              />
            ) : (
              <img
                src="/images/logo-floodbar.webp"
                alt="FloodBar.id"
                className="w-8 h-8 object-contain rounded"
                width={32}
                height={32}
              />
            )}
            <span className="font-bold text-xl">{siteName}</span>
          </Link>
          <Link href="/artikel" className="text-sm hover:text-blue-400">
            Semua Artikel
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Beranda</Link>
          <span className="mx-2">/</span>
          <Link href="/artikel" className="hover:text-blue-600">Artikel</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{article.title}</span>
        </nav>

        <Link
          href="/artikel"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Artikel
        </Link>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {article.imageUrl && (
            <div className="w-full h-64 md:h-96">
              <img
                src={article.imageUrl}
                alt={article.heroAlt || article.title}
                className="w-full h-full object-cover"
                width={1200}
                height={675}
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-6 border-b">
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-blue-500 prose-blockquote:text-gray-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link href="/order">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
              Pesan FloodBar Sekarang
            </button>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 {siteName} - Semua hak dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  )
}