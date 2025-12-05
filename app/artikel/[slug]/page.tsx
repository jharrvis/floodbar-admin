import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug }
    })
    return article
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getSettings() {
  try {
    const settings = await prisma.settings.findFirst()
    return settings
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  
  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan'
    }
  }
  
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : []
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.siteName || 'FloodBar.id'}
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <img
                src="/images/logo-floodbar.webp"
                alt="FloodBar.id"
                className="w-8 h-8 object-contain rounded"
              />
            )}
            <span className="font-bold text-xl">{settings?.siteName || 'FloodBar.id'}</span>
          </Link>
          <Link href="/artikel" className="text-sm hover:text-blue-400">
            Semua Artikel
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
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
                alt={article.title}
                className="w-full h-full object-cover"
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
            © 2025 {settings?.siteName || 'FloodBar.id'} - Semua hak dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  )
}