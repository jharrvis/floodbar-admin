'use client'

import { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { Upload, Trash2, Search, Grid, Download, Copy, Check, RefreshCw } from 'lucide-react'

interface MediaItem {
  public_id: string
  secure_url: string
  created_at: string
  width: number
  height: number
  format: string
  bytes: number
}

export default function MediaManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [uploadPreset, setUploadPreset] = useState('floodbar_uploads')
  const [refreshKey, setRefreshKey] = useState(0)
  const [cloudName, setCloudName] = useState('')
  const [configReady, setConfigReady] = useState(false)

  useEffect(() => {
    fetchMediaItems()
    
    // Fetch upload preset settings from database
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/settings/upload-preset')
        const data = await response.json()
        
        if (data.success) {
          setUploadPreset(data.uploadPreset || 'floodbar_uploads')
          setCloudName(data.cloudName || '')
          setConfigReady(true)
        } else {
          console.error('Failed to fetch config:', data.error)
          setConfigReady(false)
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        setConfigReady(false)
      }
    }
    
    fetchConfig()
  }, [])

  const fetchMediaItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media')
      const data = await response.json()
      if (data.success) {
        setMediaItems(data.resources)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (result: any) => {
    console.log('=== UPLOAD START ===')
    console.log('Upload result:', result)
    console.log('Upload info:', result.info)
    console.log('Current mediaItems count:', mediaItems.length)
    
    try {
      // Add the new item immediately to the UI for instant feedback
      const newItem: MediaItem = {
        public_id: result.info.public_id,
        secure_url: result.info.secure_url,
        created_at: result.info.created_at || new Date().toISOString(),
        width: result.info.width,
        height: result.info.height,
        format: result.info.format,
        bytes: result.info.bytes
      }
      
      console.log('New item created:', newItem)
      
      // Update UI immediately - add to the beginning of the array
      setMediaItems(prevItems => {
        console.log('Previous items:', prevItems.length)
        const newItems = [newItem, ...prevItems]
        console.log('New items total:', newItems.length)
        return newItems
      })
      
      console.log('State updated, setting isUploading to false')
      setIsUploading(false)
      
      // Force re-render
      setRefreshKey(prev => prev + 1)
      
      // Also refresh from server to ensure consistency after a short delay
      setTimeout(() => {
        console.log('Fetching fresh data from server...')
        fetchMediaItems()
        setRefreshKey(prev => prev + 1)
      }, 1500)
      
    } catch (error) {
      console.error('Error in handleUpload:', error)
      setIsUploading(false)
      // Still try to refresh from server
      fetchMediaItems()
    }
    
    console.log('=== UPLOAD END ===')
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
        setSelectedItems(prev => prev.filter(id => id !== publicId))
      } else {
        console.error('Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} gambar?`)) return

    const deletedIds: string[] = []
    
    for (const publicId of selectedItems) {
      try {
        const response = await fetch('/api/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId })
        })
        if (response.ok) {
          deletedIds.push(publicId)
        }
      } catch (error) {
        console.error('Error deleting media:', error)
      }
    }
    
    // Update UI immediately
    setMediaItems(prevItems => 
      prevItems.filter(item => !deletedIds.includes(item.public_id))
    )
    setSelectedItems([])
  }


  const handleSelectItem = (publicId: string) => {
    setSelectedItems(prev => 
      prev.includes(publicId) 
        ? prev.filter(id => id !== publicId)
        : [...prev, publicId]
    )
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMedia = mediaItems.filter(item =>
    item.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
                  <p className="text-gray-600 mt-1">
                    Kelola semua gambar yang telah diupload
                  </p>
                </div>
                
{configReady ? (
                  <CldUploadWidget
                      key={`upload-${uploadPreset}`}
                      uploadPreset={uploadPreset}
                      options={{
                        maxFiles: 10,
                        resourceType: 'image',
                        maxImageWidth: 1920,
                        maxImageHeight: 1080,
                        cropping: false,
                        multiple: true,
                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                        sources: ['local', 'url']
                      }}
                      onUpload={(result, { widget }) => {
                        console.log('onUpload triggered:', result)
                        handleUpload(result)
                      }}
                      onSuccess={(result, { widget }) => {
                        console.log('onSuccess triggered:', result)
                        handleUpload(result)
                      }}
                      onQueuesEnd={(result, { widget }) => {
                        console.log('onQueuesEnd triggered, fetching media items')
                        // This ensures we refresh when all uploads are done
                        setTimeout(() => {
                          fetchMediaItems()
                          setRefreshKey(prev => prev + 1)
                        }, 500)
                      }}
                      onOpen={() => {
                        console.log('Upload widget opened')
                        setIsUploading(true)
                      }}
                      onClose={() => {
                        console.log('Upload widget closed')
                        setIsUploading(false)
                        // Also refresh when widget is closed
                        setTimeout(() => {
                          console.log('Widget closed, refreshing media')
                          fetchMediaItems()
                          setRefreshKey(prev => prev + 1)
                        }, 300)
                      }}
                    >
                      {({ open }) => (
                        <button
                          onClick={() => open?.()}
                          disabled={isUploading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Upload size={20} />
                          {isUploading ? 'Uploading...' : 'Upload Media'}
                        </button>
                      )}
                  </CldUploadWidget>
                ) : (
                  <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-500">
                    <Upload size={20} />
                    Loading configuration...
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={fetchMediaItems}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Total: {filteredMedia.length} images
                    {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={20} />
                      Delete ({selectedItems.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading media...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12">
                  <Grid className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try a different search term' : 'Upload some images to get started'}
                  </p>
                </div>
              ) : (
                <div key={refreshKey} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.public_id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-square">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.public_id)}
                          onChange={() => handleSelectItem(item.public_id)}
                          className="absolute top-2 left-2 z-10 w-4 h-4"
                        />
                        <Image
                          src={item.secure_url}
                          alt={item.public_id}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(item.secure_url)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                              title="Copy URL"
                            >
                              {copiedUrl === item.secure_url ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} className="text-gray-600" />
                              )}
                            </button>
                            <a
                              href={item.secure_url}
                              download
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                              title="Download"
                            >
                              <Download size={16} className="text-gray-600" />
                            </a>
                            <button
                              onClick={() => handleDeleteMedia(item.public_id)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
                          {item.public_id.split('/').pop()}
                        </h3>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>{item.width} × {item.height}</p>
                          <p>{formatFileSize(item.bytes)} • {item.format.toUpperCase()}</p>
                          <p>{formatDate(item.created_at)}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.secure_url)}
                          className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {copiedUrl === item.secure_url ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}