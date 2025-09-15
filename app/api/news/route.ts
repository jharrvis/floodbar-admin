import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const onlyActive = searchParams.get('active') !== 'false'
    
    const whereClause = onlyActive ? { isActive: true } : {}
    
    const news = await prisma.news.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
      take: 20 // Limit to 20 most recent news
    })

    return NextResponse.json({
      success: true,
      data: news
    })

  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.summary || !data.sourceUrl || !data.sourceName) {
      return NextResponse.json(
        { success: false, error: 'Title, summary, source URL, dan source name wajib diisi' },
        { status: 400 }
      )
    }

    const newsData = {
      title: data.title,
      summary: data.summary,
      imageUrl: data.imageUrl || '',
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    }

    const newNews = await prisma.news.create({
      data: newsData
    })

    return NextResponse.json({
      success: true,
      data: newNews,
      message: 'Berita berhasil ditambahkan'
    })

  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}