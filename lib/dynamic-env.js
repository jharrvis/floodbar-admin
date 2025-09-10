// Dynamic environment variable loader
// This runs at build time and runtime to set Cloudinary config from database

const { PrismaClient } = require('@prisma/client')

async function loadCloudinaryConfig() {
  try {
    const prisma = new PrismaClient()
    
    const setting = await prisma.adminSettings.findFirst({
      where: { key: 'cloudinary_settings' }
    })

    if (setting && setting.value) {
      const config = JSON.parse(setting.value)
      if (config.cloudName && config.apiKey && config.apiSecret) {
        // Set environment variables dynamically
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = config.cloudName
        process.env.CLOUDINARY_API_KEY = config.apiKey
        process.env.CLOUDINARY_API_SECRET = config.apiSecret
        process.env.CLOUDINARY_UPLOAD_PRESET = config.uploadPreset || 'floodbar_uploads'
        
        console.log('✅ Loaded Cloudinary config from database:', config.cloudName)
        return true
      }
    }
    
    console.log('⚠️  No Cloudinary config found in database, using fallback')
    return false
  } catch (error) {
    console.error('❌ Error loading Cloudinary config from database:', error.message)
    return false
  }
}

module.exports = { loadCloudinaryConfig }