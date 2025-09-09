import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Always return environment variables first for production reliability
    const envSettings = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'floodbar_uploads'
    }

    // Return environment settings if available
    if (envSettings.cloudName && envSettings.apiKey && envSettings.apiSecret) {
      return NextResponse.json(envSettings)
    }

    // Try database as fallback
    const settingsRecord = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })

    if (settingsRecord && settingsRecord.value) {
      const settings = JSON.parse(settingsRecord.value)
      return NextResponse.json({
        cloudName: settings.cloudName || '',
        apiKey: settings.apiKey || '',
        apiSecret: settings.apiSecret || '',
        uploadPreset: settings.uploadPreset || 'floodbar_uploads'
      })
    }

    // Return empty/default values if nothing found
    return NextResponse.json({
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      uploadPreset: 'floodbar_uploads'
    })
  } catch (error) {
    console.error('Error fetching Cloudinary settings:', error)
    return NextResponse.json(
      { 
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'floodbar_uploads'
      },
      { status: 200 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { cloudName, apiKey, apiSecret, uploadPreset } = data

    // Save to AdminSettings table
    const settingsData = {
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset: uploadPreset || 'floodbar_uploads'
    }

    const existingSetting = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })

    if (existingSetting) {
      // Update existing settings
      await prisma.adminSettings.update({
        where: { id: existingSetting.id },
        data: {
          value: JSON.stringify(settingsData),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings
      await prisma.adminSettings.create({
        data: {
          key: 'cloudinary_settings',
          value: JSON.stringify(settingsData),
          description: 'Cloudinary configuration settings'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cloudinary settings saved successfully',
      data: { cloudName, apiKey, apiSecret: '***', uploadPreset: settingsData.uploadPreset }
    })
  } catch (error) {
    console.error('Error saving Cloudinary settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save Cloudinary settings' },
      { status: 500 }
    )
  }
}

