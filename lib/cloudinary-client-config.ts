'use client'

// Client-side Cloudinary configuration helper
export class CloudinaryClientConfig {
  private static cloudName: string | null = null
  private static initialized = false

  static async initialize() {
    if (this.initialized && this.cloudName) {
      return this.cloudName
    }

    try {
      const response = await fetch('/api/settings/upload-preset')
      const data = await response.json()
      
      if (data.success && data.cloudName) {
        this.cloudName = data.cloudName
        this.initialized = true
        
        // Set global environment variable for next-cloudinary
        if (typeof window !== 'undefined') {
          (window as any).process = (window as any).process || {}
          ;(window as any).process.env = (window as any).process.env || {}
          ;(window as any).process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = data.cloudName
          
          // Also set it directly on window for compatibility
          ;(window as any).NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = data.cloudName
        }
        
        return this.cloudName
      }
    } catch (error) {
      console.error('Failed to initialize Cloudinary client config:', error)
    }
    
    return null
  }

  static getCloudName(): string | null {
    return this.cloudName
  }

  static isInitialized(): boolean {
    return this.initialized
  }
}