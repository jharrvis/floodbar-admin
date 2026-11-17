import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const { title, embedUrl, isActive } = body

    if (!title || !embedUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and embedUrl are required' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        embedUrl,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    )
  }
}