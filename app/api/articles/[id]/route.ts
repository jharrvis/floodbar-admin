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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    let article = await prisma.article.findUnique({
      where: { id }
    })
    
    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug: id }
      })
    }

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: article
    })

  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existingArticle = await prisma.article.findUnique({
      where: { id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }

    let slug = data.slug || generateSlug(data.title || existingArticle.title)
    
    if (slug !== existingArticle.slug) {
      const duplicateSlug = await prisma.article.findFirst({
        where: { 
          slug,
          id: { not: id }
        }
      })
      
      if (duplicateSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const wasPublished = existingArticle.isPublished
    const isNowPublished = data.isPublished !== undefined ? Boolean(data.isPublished) : wasPublished

    const updateData: any = {
      title: data.title || existingArticle.title,
      slug,
      content: data.content || existingArticle.content,
      excerpt: data.excerpt || existingArticle.excerpt,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : existingArticle.imageUrl,
      author: data.author || existingArticle.author,
      isPublished: isNowPublished
    }

    if (!wasPublished && isNowPublished) {
      updateData.publishedAt = new Date()
    } else if (wasPublished && !isNowPublished) {
      updateData.publishedAt = null
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'Artikel berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingArticle = await prisma.article.findUnique({
      where: { id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Artikel berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
