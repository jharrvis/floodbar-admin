import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const onlyPublished = searchParams.get('published') !== 'false'
    
    const whereClause = onlyPublished ? { isPublished: true } : {}
    
    const articles = await prisma.article.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: articles
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.title || !data.content || !data.excerpt || !data.author) {
      return NextResponse.json(
        { success: false, error: 'Title, content, excerpt, dan author wajib diisi' },
        { status: 400 }
      )
    }

    let slug = data.slug || generateSlug(data.title)
    
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })
    
    if (existingArticle) {
      slug = `${slug}-${Date.now()}`
    }

    const articleData = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      imageUrl: data.imageUrl || null,
      author: data.author,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : false,
      publishedAt: data.isPublished ? new Date() : null
    }

    const newArticle = await prisma.article.create({
      data: articleData
    })

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Artikel berhasil ditambahkan'
    })

  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
