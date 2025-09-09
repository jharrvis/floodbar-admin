import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT cloudName, apiKey, apiSecret, uploadPreset 
      FROM cloudinary_settings 
      ORDER BY createdAt DESC 
      LIMIT 1
    `) as any[]

    const settings = settingsResult.length > 0 ? settingsResult[0] : {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      uploadPreset: 'floodbar_uploads'
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching Cloudinary settings:', error)
    return NextResponse.json(
      { cloudName: '', apiKey: '', apiSecret: '', uploadPreset: 'floodbar_uploads' },
      { status: 200 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { cloudName, apiKey, apiSecret, uploadPreset } = data

    // Check if settings exist
    const existingSettingsResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM cloudinary_settings LIMIT 1
    `) as any[]

    if (existingSettingsResult && existingSettingsResult.length > 0) {
      // Update existing settings
      await prisma.$executeRawUnsafe(`
        UPDATE cloudinary_settings 
        SET cloudName = ?, apiKey = ?, apiSecret = ?, uploadPreset = ?, updatedAt = NOW()
        WHERE id = ?
      `, cloudName, apiKey, apiSecret, uploadPreset, existingSettingsResult[0].id)
    } else {
      // Create new settings
      await prisma.$executeRawUnsafe(`
        INSERT INTO cloudinary_settings (id, cloudName, apiKey, apiSecret, uploadPreset)
        VALUES (?, ?, ?, ?, ?)
      `, 'cloudinary-' + Date.now(), cloudName, apiKey, apiSecret, uploadPreset)
    }

    // Also update environment file
    await updateEnvironmentFile(data)

    return NextResponse.json({ 
      success: true, 
      message: 'Cloudinary settings saved successfully',
      data: { cloudName, apiKey, apiSecret: '***', uploadPreset }
    })
  } catch (error) {
    console.error('Error saving Cloudinary settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save Cloudinary settings' },
      { status: 500 }
    )
  }
}

async function updateEnvironmentFile(settings: any) {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8')
    } catch (err) {
      // File doesn't exist, create new content
    }
    
    // Update or add Cloudinary variables
    const envVars = {
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': settings.cloudName,
      'CLOUDINARY_API_KEY': settings.apiKey,
      'CLOUDINARY_API_SECRET': settings.apiSecret
    }
    
    let newContent = envContent
    
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'm')
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `${key}=${value}`)
      } else {
        newContent += `\n${key}=${value}`
      }
    })
    
    fs.writeFileSync(envPath, newContent.trim() + '\n')
  } catch (error) {
    console.error('Error updating environment file:', error)
  }
}