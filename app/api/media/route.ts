import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { configureCloudinary } from '@/lib/cloudinary-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all media from Cloudinary
export async function GET(request: Request) {
  try {
    // Configure Cloudinary from database/environment
    const configured = await configureCloudinary()
    if (!configured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration not found. Please configure in admin settings.' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'floodbar'
    
    // Try search API first with folder filter
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .max_results(100)
      .execute()

    return NextResponse.json({
      success: true,
      resources: result.resources
    })
  } catch (error) {
    console.error('Error fetching media with search API:', error)
    
    // Fallback to admin API with folder prefix
    try {
      const folder = new URL(request.url).searchParams.get('folder') || 'floodbar'
      const adminResult = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        prefix: folder,
        max_results: 100
      })
      
      return NextResponse.json({
        success: true,
        resources: adminResult.resources
      })
    } catch (adminError) {
      console.error('Error fetching media with admin API:', adminError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media' },
        { status: 500 }
      )
    }
  }
}

// DELETE - Delete media from Cloudinary
export async function DELETE(request: Request) {
  try {
    // Configure Cloudinary from database/environment
    const configured = await configureCloudinary()
    if (!configured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration not found. Please configure in admin settings.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { public_id } = body

    if (!public_id) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(public_id)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Media deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete media' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}