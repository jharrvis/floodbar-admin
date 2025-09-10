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
    // Only use database settings - no environment variables
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

    console.log('No Cloudinary configuration found in database')
    return null
  } catch (error) {
    console.error('Error getting Cloudinary config from database:', error)
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