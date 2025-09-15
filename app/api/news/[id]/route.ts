import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id }
    })

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.summary || !data.sourceUrl || !data.sourceName) {
      return NextResponse.json(
        { success: false, error: 'Title, summary, source URL, dan source name wajib diisi' },
        { status: 400 }
      )
    }

    const updateData = {
      title: data.title,
      summary: data.summary,
      imageUrl: data.imageUrl || '',
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    )

    const updatedNews = await prisma.news.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedNews,
      message: 'Berita berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.news.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}