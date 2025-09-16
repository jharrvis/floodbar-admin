import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, embedUrl, isActive } = body
    const { id } = params

    if (!title || !embedUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and embedUrl are required' },
        { status: 400 }
      )
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        title,
        embedUrl,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}