import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Get upload preset from Cloudinary settings
export async function GET() {
  try {
    // Try to get from environment first
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'floodbar_uploads'
    
    return NextResponse.json({
      success: true,
      uploadPreset: uploadPreset,
      folder: 'floodbar' // Default folder
    })
  } catch (error) {
    console.error('Error getting upload preset:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get upload preset',
        uploadPreset: 'floodbar_uploads', // fallback
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