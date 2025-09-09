import { NextResponse } from 'next/server'
import { getCloudinaryConfig } from '@/lib/cloudinary-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Get upload preset from Cloudinary settings
export async function GET() {
  try {
    const config = await getCloudinaryConfig()
    
    if (config) {
      return NextResponse.json({
        success: true,
        uploadPreset: config.uploadPreset,
        cloudName: config.cloudName,
        folder: 'floodbar'
      })
    }
    
    // Fallback
    return NextResponse.json({
      success: true,
      uploadPreset: 'floodbar_uploads',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      folder: 'floodbar'
    })
  } catch (error) {
    console.error('Error getting upload preset:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get upload preset',
        uploadPreset: 'floodbar_uploads',
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
        folder: 'floodbar'
      },
      { status: 500 }
    )
  }
}

// PUT - Update upload preset (this would typically sync with settings)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { uploadPreset, folder } = body

    // In a real app, this would save to database
    // For now, we'll just return the values
    
    return NextResponse.json({
      success: true,
      uploadPreset: uploadPreset || 'floodbar_uploads',
      folder: folder || 'floodbar',
      message: 'Upload preset settings updated'
    })
  } catch (error) {
    console.error('Error updating upload preset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update upload preset' },
      { status: 500 }
    )
  }
}