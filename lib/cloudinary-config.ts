import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

let cachedConfig: CloudinaryConfig | null = null

export async function getCloudinaryConfig(): Promise<CloudinaryConfig | null> {
  try {
    // Always prioritize environment variables in production for reliability
    const envConfig: CloudinaryConfig = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'floodbar_uploads'
    }

    if (envConfig.cloudName && envConfig.apiKey && envConfig.apiSecret) {
      cachedConfig = envConfig
      return envConfig
    }

    // Try database as secondary option
    const setting = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })

    if (setting && setting.value) {
      const config = JSON.parse(setting.value) as CloudinaryConfig
      if (config.cloudName && config.apiKey && config.apiSecret) {
        cachedConfig = config
        return config
      }
    }

    return null
  } catch (error) {
    console.error('Error getting Cloudinary config:', error)
    
    // Final fallback to environment variables
    const envConfig: CloudinaryConfig = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'floodbar_uploads'
    }

    if (envConfig.cloudName && envConfig.apiKey && envConfig.apiSecret) {
      return envConfig
    }

    return null
  }
}

export async function configureCloudinary(): Promise<boolean> {
  const config = await getCloudinaryConfig()
  
  if (!config) {
    console.error('Cloudinary configuration not found')
    return false
  }

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  })

  return true
}

export function getCachedConfig(): CloudinaryConfig | null {
  return cachedConfig
}