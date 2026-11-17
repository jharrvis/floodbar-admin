import Link from 'next/link'
import { SiteHeader, SiteFooter } from '../components/SiteChrome'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const PAGE_SIZE = 12

async function getArticles(page: number) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const total = await prisma.article.count({ where: { isPublished: true } })
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
      const safePage = Math.min(Math.max(1, page), totalPages)
      const articles = await prisma.article.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          heroAlt: true,
          author: true,
          publishedAt: true,
          createdAt: true
        }
      })
      return { articles, total, totalPages, page: safePage }
    } catch (error) {
      if (attempt === 3) {
        console.error('Error fetching articles:', error)
        return { articles: [], total: 0, totalPages: 1, page: 1 }
      }
      await wait(300 * attempt)
    }
  }
  return { articles: [], total: 0, totalPages: 1, page: 1 }
}

function pageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cand = [1, 2, total - 1, total, current - 1, current, current + 1]
  const sorted = cand.filter((n, i) => n >= 1 && n <= total && cand.indexOf(n) === i).sort((a, b) => a - b)
  const out: (number | '...')[] = []
  let prev = 0
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push('...')
    out.push(n)
    prev = n
  }
  return out
}

async function getSettings() {
  try {
    return await prisma.settings.findFirst()
  } catch {
    return null
  }
}

export const metadata = {
  title: 'Artikel - FloodBar.id',
  description: 'Baca artikel terbaru seputar tips perlindungan banjir dan informasi FloodBar',
  alternates: { canonical: '/artikel' },
  robots: { index: true, follow: true }
}

export default async function ArticlesPage({ searchParams }: { searchParams?: { page?: string } }) {
  const requested = parseInt(searchParams?.page || '1', 10)
  const { articles, total, totalPages, page } = await getArticles(Number.isNaN(requested) ? 1 : requested)
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
      <SiteHeader />

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
                      alt={article.heroAlt || article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={640}
                      height={360}
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

        {totalPages > 1 && (
          <nav className="mt-12 flex flex-col items-center gap-4" aria-label="Pagination">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {page > 1 && (
                <Link href={page - 1 === 1 ? '/artikel' : `/artikel?page=${page - 1}`} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  &laquo; Sebelumnya
                </Link>
              )}
              {pageWindow(page, totalPages).map((n, i) =>
                n === '...' ? (
                  <span key={`e${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <Link
                    key={n}
                    href={n === 1 ? '/artikel' : `/artikel?page=${n}`}
                    className={n === page
                      ? 'px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium'
                      : 'px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium'}
                  >
                    {n}
                  </Link>
                )
              )}
              {page < totalPages && (
                <Link href={`/artikel?page=${page + 1}`} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  Berikutnya &raquo;
                </Link>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Halaman {page} dari {totalPages} — menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} dari {total} artikel
            </p>
          </nav>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}