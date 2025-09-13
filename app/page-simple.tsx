'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function HomePage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const result = await response.json()
      setSettings(result)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName || 'FloodBar.id'} 
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            )}
            <span className="font-bold text-xl">{settings?.siteName || 'FloodBar.id'}</span>
          </div>
        </div>
      </nav>

      {/* Simple Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">{settings?.siteName || 'FloodBar.id'}</h1>
          <p className="text-xl text-gray-600 mb-8">{settings?.siteDescription || 'Sekat pintu anti banjir custom'}</p>
          
          {/* Social Media Links */}
          {(settings?.instagramUrl || settings?.facebookUrl || settings?.tiktokUrl) && (
            <div className="flex justify-center space-x-4 mb-6">
              {settings.instagramUrl && (
                <a 
                  href={settings.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full text-white"
                >
                  Instagram
                </a>
              )}
              {settings.facebookUrl && (
                <a 
                  href={settings.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full text-white"
                >
                  Facebook
                </a>
              )}
              {settings.tiktokUrl && (
                <a 
                  href={settings.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black p-3 rounded-full text-white"
                >
                  TikTok
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}