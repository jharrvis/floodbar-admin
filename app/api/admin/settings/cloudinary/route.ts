import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Only use database settings
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

    // Return empty/default values if nothing found in database
    return NextResponse.json({
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      uploadPreset: 'floodbar_uploads'
    })
  } catch (error) {
    console.error('Error fetching Cloudinary settings from database:', error)
    return NextResponse.json(
      { 
        cloudName: '',
        apiKey: '',
        apiSecret: '',
        uploadPreset: 'floodbar_uploads'
      },
      { status: 200 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== CLOUDINARY SETTINGS SAVE START ===')
    
    const data = await request.json()
    console.log('Received data:', { 
      cloudName: data.cloudName || 'NOT SET',
      apiKey: data.apiKey ? 'SET' : 'NOT SET',
      apiSecret: data.apiSecret ? 'SET' : 'NOT SET',
      uploadPreset: data.uploadPreset || 'NOT SET'
    })
    
    const { cloudName, apiKey, apiSecret, uploadPreset } = data

    if (!cloudName || !apiKey || !apiSecret) {
      console.log('Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: cloudName, apiKey, and apiSecret are required' },
        { status: 400 }
      )
    }

    // Save to AdminSettings table
    const settingsData = {
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset: uploadPreset || 'floodbar_uploads'
    }

    console.log('Searching for existing settings...')
    const existingSetting = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })

    if (existingSetting) {
      console.log('Updating existing settings...')
      await prisma.adminSettings.update({
        where: { id: existingSetting.id },
        data: {
          value: JSON.stringify(settingsData),
          updatedAt: new Date()
        }
      })
      console.log('Settings updated successfully')
    } else {
      console.log('Creating new settings...')
      await prisma.adminSettings.create({
        data: {
          key: 'cloudinary_settings',
          value: JSON.stringify(settingsData),
          description: 'Cloudinary configuration settings'
        }
      })
      console.log('Settings created successfully')
    }

    // Verify settings were saved
    const savedSettings = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })
    
    if (savedSettings) {
      console.log('Settings verified in database')
      const parsedSettings = JSON.parse(savedSettings.value)
      console.log('Saved settings:', {
        cloudName: parsedSettings.cloudName || 'NOT SET',
        apiKey: parsedSettings.apiKey ? 'SET' : 'NOT SET',
        apiSecret: parsedSettings.apiSecret ? 'SET' : 'NOT SET',
        uploadPreset: parsedSettings.uploadPreset || 'NOT SET'
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cloudinary settings saved successfully',
      data: { 
        cloudName, 
        apiKey: apiKey.substring(0, 3) + '***' + apiKey.slice(-3), 
        apiSecret: '***', 
        uploadPreset: settingsData.uploadPreset 
      }
    })
  } catch (error) {
    console.error('Error saving Cloudinary settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save Cloudinary settings: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

