'use client'

import { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { Upload, X, Grid, Search, Trash2 } from 'lucide-react'
import { CloudinaryClientConfig } from '@/lib/cloudinary-client-config'

interface MediaItem {
  public_id: string
  secure_url: string
  created_at: string
  width: number
  height: number
  format: string
  bytes: number
}

interface MediaSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showMediaLibrary?: boolean
}

export default function MediaSelector({ value, onChange, disabled, showMediaLibrary = true }: MediaSelectorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadPreset, setUploadPreset] = useState('floodbar_uploads')
  const [refreshKey, setRefreshKey] = useState(0)
  const [cloudName, setCloudName] = useState('')
  const [configReady, setConfigReady] = useState(false)

  // Debug value changes
  useEffect(() => {
    console.log('MediaSelector value changed:', value)
  }, [value])

  // Debug refreshKey changes
  useEffect(() => {
    console.log('MediaSelector refreshKey changed:', refreshKey)
  }, [refreshKey])

  useEffect(() => {
    // Initialize Cloudinary client configuration
    const initCloudinary = async () => {
      try {
        const cloudName = await CloudinaryClientConfig.initialize()
        
        if (cloudName) {
          setCloudName(cloudName)
          setConfigReady(true)
          
          // Fetch additional config
          const response = await fetch('/api/settings/upload-preset')
          const data = await response.json()
          
          if (data.success) {
            setUploadPreset(data.uploadPreset || 'floodbar_uploads')
          }
        } else {
          console.error('Failed to initialize Cloudinary config')
          setConfigReady(false)
        }
      } catch (error) {
        console.error('Error initializing Cloudinary config:', error)
        setConfigReady(false)
      }
    }
    
    initCloudinary()
  }, [])

  const handleUpload = (result: any) => {
    console.log('=== MediaSelector UPLOAD START ===')
    console.log('Upload result:', result)
    console.log('Upload info:', result.info)
    console.log('Current value:', value)
    
    try {
      const url = result.info.secure_url
      console.log('New URL:', url)
      
      // Update the preview immediately - this is critical for landing page editor
      console.log('Calling onChange with new URL')
      onChange(url)
      
      // Force immediate re-render
      setRefreshKey(prev => {
        const newKey = prev + 1
        console.log('Setting refreshKey to:', newKey)
        return newKey
      })
      
      setIsUploading(false)
      
      // Add to media library cache immediately
      const newItem: MediaItem = {
        public_id: result.info.public_id,
        secure_url: result.info.secure_url,
        created_at: result.info.created_at || new Date().toISOString(),
        width: result.info.width,
        height: result.info.height,
        format: result.info.format,
        bytes: result.info.bytes
      }
      
      console.log('Adding to media cache:', newItem)
      
      // Update media library cache
      setMediaItems(prevItems => [newItem, ...prevItems])
      
      // Additional force update after small delay to ensure onChange takes effect
      setTimeout(() => {
        console.log('Secondary refresh - fetching media and updating refreshKey')
        fetchMediaItems()
        setRefreshKey(prev => prev + 1)
        
        // Double check that parent component received the new value
        console.log('Value should now be:', url)
      }, 500)
      
    } catch (error) {
      console.error('Error in MediaSelector handleUpload:', error)
      setIsUploading(false)
    }
    
    console.log('=== MediaSelector UPLOAD END ===')
  }

  const handleRemove = () => {
    onChange('')
  }

  const fetchMediaItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media')
      const data = await response.json()
      if (data.success && data.resources) {
        setMediaItems(data.resources)
      } else {
        console.error('Failed to fetch media:', data.error)
        setMediaItems([])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      setMediaItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (url: string) => {
    onChange(url)
    setShowLibrary(false)
  }

  const handleDeleteMedia = async (publicId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return
    
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      })
      
      if (response.ok) {
        // Update UI immediately without refetching
        setMediaItems(prevItems => 
          prevItems.filter(item => item.public_id !== publicId)
        )
      } else {
        console.error('Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const filteredMedia = mediaItems.filter(item =>
    item.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {value && (
        <div key={`container-${refreshKey}`} className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={`${value}${value.includes('?') ? '&' : '?'}t=${Date.now()}&r=${refreshKey}`}
            alt="Selected image"
            fill
            className="object-cover"
            key={`img-${value}-${refreshKey}-${Date.now()}`} // Force re-render with timestamp
            unoptimized // Disable Next.js image optimization to avoid caching issues
            priority // Load image with high priority for immediate display
            onLoad={() => console.log('MediaSelector image loaded:', value)}
            onError={(e) => console.error('MediaSelector image error:', e)}
          />
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        {configReady && cloudName ? (
          <CldUploadWidget
            key={`selector-${uploadPreset}-${cloudName}`}
            uploadPreset={uploadPreset}
            options={{
              maxFiles: 1,
              resourceType: 'image',
              maxImageWidth: 1920,
              maxImageHeight: 1080,
              cropping: false,
              multiple: false,
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
              cloudName: cloudName
            }}
            onUpload={(result, { widget }) => {
              console.log('MediaSelector onUpload triggered:', result)
              handleUpload(result)
            }}
            onSuccess={(result, { widget }) => {
              console.log('MediaSelector onSuccess triggered:', result)
              handleUpload(result)
            }}
            onQueuesEnd={(result, { widget }) => {
              console.log('MediaSelector onQueuesEnd triggered')
              // Ensure final refresh when all uploads are done
              setTimeout(() => {
                setRefreshKey(prev => prev + 1)
              }, 300)
            }}
            onOpen={() => {
              console.log('MediaSelector upload widget opened')
              setIsUploading(true)
            }}
            onClose={() => {
              console.log('MediaSelector upload widget closed')
              setIsUploading(false)
              // Additional refresh when widget closes to ensure preview updates
              setTimeout(() => {
                console.log('Widget closed, forcing refresh')
                setRefreshKey(prev => prev + 1)
              }, 200)
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open?.()}
                disabled={disabled || isUploading}
                className="flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : 'Upload New'}
                </p>
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="flex-1 border-2 border-dashed rounded-lg p-4 text-center border-gray-300 bg-gray-50">
            <Upload className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {configReady ? 'Cloudinary not configured' : 'Loading configuration...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Please configure Cloudinary in admin settings
            </p>
          </div>
        )}

        {showMediaLibrary && (
          <button
            type="button"
            onClick={() => {
              setShowLibrary(true)
              fetchMediaItems()
            }}
            disabled={disabled}
            className="flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors border-blue-300 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Grid className="mx-auto h-8 w-8 text-blue-400 mb-2" />
            <p className="text-sm text-blue-600">Media Library</p>
          </button>
        )}
      </div>

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Media Library</h3>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading media...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <Grid className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.public_id}
                      className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        className="aspect-square relative"
                        onClick={() => handleMediaSelect(item.secure_url)}
                      >
                        <Image
                          src={item.secure_url}
                          alt={item.public_id}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {value === item.secure_url && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMedia(item.public_id)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="p-2">
                        <p className="text-xs text-gray-500 truncate">{item.public_id}</p>
                        <p className="text-xs text-gray-400">
                          {item.width}x{item.height} • {(item.bytes / 1024).toFixed(1)}KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}