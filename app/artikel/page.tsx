import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        author: true,
        publishedAt: true,
        createdAt: true
      }
    })
    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
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

export const metadata = {
  title: 'Artikel - FloodBar.id',
  description: 'Baca artikel terbaru seputar tips perlindungan banjir dan informasi FloodBar'
}

export default async function ArticlesPage() {
  const articles = await getArticles()
  const settings = await getSettings()

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('id-ID', {
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
          <Link href="/" className="text-sm hover:text-blue-400">
            Kembali ke Beranda
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Artikel & Tips
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Baca artikel terbaru seputar tips perlindungan banjir, perawatan FloodBar, dan informasi berguna lainnya
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any) => (
              <Link 
                key={article.id} 
                href={`/artikel/${article.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {article.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold opacity-30">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:text-blue-800">
                    Baca Selengkapnya
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Belum ada artikel yang dipublish</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Kembali ke Beranda
            </Link>
          </div>
        )}
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