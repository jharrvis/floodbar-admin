import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// GET - Retrieve page content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('type') // 'payment_success' or 'payment_failure'
    
    if (!pageType || !['payment_success', 'payment_failure'].includes(pageType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid page type' },
        { status: 400 }
      )
    }
    
    const contentResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM page_contents WHERE page_type = ? AND is_active = TRUE LIMIT 1
    `, pageType) as any[]
    
    if (contentResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page content not found' },
        { status: 404 }
      )
    }
    
    const content = contentResult[0]
    
    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        page_type: content.page_type,
        title: content.title,
        subtitle: content.subtitle,
        content_sections: JSON.parse(content.content_sections || '{}'),
        contact_info: JSON.parse(content.contact_info || '{}'),
        is_active: content.is_active,
        updatedAt: content.updatedAt
      }
    })
    
  } catch (error) {
    console.error('Error fetching page content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page content' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update page content
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { page_type, title, subtitle, content_sections, contact_info } = data
    
    if (!page_type || !['payment_success', 'payment_failure'].includes(page_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid page type' },
        { status: 400 }
      )
    }
    
    // Update existing content
    await prisma.$executeRawUnsafe(`
      UPDATE page_contents 
      SET title = ?, subtitle = ?, content_sections = ?, contact_info = ?, updatedAt = NOW()
      WHERE page_type = ? AND is_active = TRUE
    `,
      title || '',
      subtitle || '',
      JSON.stringify(content_sections || {}),
      JSON.stringify(contact_info || {}),
      page_type
    )
    
    return NextResponse.json({
      success: true,
      message: 'Page content updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating page content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update page content' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}