import { NextResponse } from 'next/server'
import { getCloudinaryConfig } from '@/lib/cloudinary-config'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST - Sync environment variables with database values
export async function POST() {
  try {
    const config = await getCloudinaryConfig()
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'No Cloudinary configuration found in database'
      }, { status: 400 })
    }

    // Read current .env.local file
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8')
    } catch (error) {
      // If file doesn't exist, create basic structure
      envContent = `NEXTAUTH_URL=http://localhost:3009
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar

# Cloudinary Configuration - Synced from database
`
    }

    // Update or add Cloudinary variables with database values
    const updates = {
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': config.cloudName,
      'CLOUDINARY_API_KEY': config.apiKey,
      'CLOUDINARY_API_SECRET': config.apiSecret,
      'CLOUDINARY_UPLOAD_PRESET': config.uploadPreset || 'floodbar_uploads'
    }

    let updatedContent = envContent

    // Update each variable
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      const newLine = `${key}=${value}`
      
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, newLine)
      } else {
        // Add at the end of Cloudinary section
        if (updatedContent.includes('# Cloudinary Configuration')) {
          updatedContent += `${newLine}\n`
        } else {
          updatedContent += `\n# Cloudinary Configuration - Synced from database\n${newLine}\n`
        }
      }
    })

    // Write back to file
    fs.writeFileSync(envPath, updatedContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Environment variables synced with database successfully',
      config: {
        cloudName: config.cloudName,
        uploadPreset: config.uploadPreset
      }
    })

  } catch (error) {
    console.error('Error syncing environment variables:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to sync environment variables'
    }, { status: 500 })
  }
}