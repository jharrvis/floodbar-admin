'use client'

import { useState, useEffect } from 'react'
import { Save, Edit, Eye, FileText } from 'lucide-react'

interface PageContent {
  id: string
  page_type: string
  title: string
  subtitle: string
  content_sections: any
  contact_info: any
  is_active: boolean
  updatedAt: string
}

export default function PageContentPage() {
  const [contents, setContents] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingContent, setEditingContent] = useState<PageContent | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPageContents()
  }, [])

  const loadPageContents = async () => {
    setLoading(true)
    try {
      // Load both success and failure page contents
      const [successResponse, failureResponse] = await Promise.all([
        fetch('/api/page-content?type=payment_success'),
        fetch('/api/page-content?type=payment_failure')
      ])

      const successResult = await successResponse.json()
      const failureResult = await failureResponse.json()

      const loadedContents = []
      
      if (successResult.success) {
        loadedContents.push(successResult.content)
      }
      
      if (failureResult.success) {
        loadedContents.push(failureResult.content)
      }

      setContents(loadedContents)
    } catch (error) {
      console.error('Error loading page contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (content: PageContent) => {
    setSaving(true)
    try {
      const response = await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_type: content.page_type,
          title: content.title,
          subtitle: content.subtitle,
          content_sections: content.content_sections,
          contact_info: content.contact_info
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Konten berhasil disimpan!')
        loadPageContents()
        setEditingContent(null)
      } else {
        alert('Gagal menyimpan konten: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Terjadi kesalahan saat menyimpan konten')
    } finally {
      setSaving(false)
    }
  }

  const getPageTypeLabel = (pageType: string) => {
    return pageType === 'payment_success' ? 'Halaman Sukses Pembayaran' : 'Halaman Gagal Pembayaran'
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Memuat konten halaman...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Konten Halaman</h1>
          <p className="text-gray-600 mt-1">Edit konten halaman pembayaran sukses dan gagal</p>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-6">
        {contents.map((content) => (
          <div key={content.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={20} />
                  {getPageTypeLabel(content.page_type)}
                </h2>
                <p className="text-sm text-gray-500">Terakhir diupdate: {new Date(content.updatedAt).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={content.page_type === 'payment_success' ? '/payment/success' : '/payment/failure'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye size={16} />
                  Preview
                </a>
                <button
                  onClick={() => setEditingContent(content)}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Judul</h3>
                <p className="text-gray-600">{content.title}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Subtitle</h3>
                <p className="text-gray-600 text-sm">{content.subtitle}</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Kontak Customer Service</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Email: {content.contact_info?.customer_service_email || 'Belum diset'}</span>
                <span>WhatsApp: {content.contact_info?.whatsapp || 'Belum diset'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit {getPageTypeLabel(editingContent.page_type)}</h3>
              <button
                onClick={() => setEditingContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Halaman
                  </label>
                  <input
                    type="text"
                    value={editingContent.title}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle/Deskripsi
                  </label>
                  <textarea
                    value={editingContent.subtitle}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      subtitle: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Informasi Kontak</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Customer Service
                    </label>
                    <input
                      type="email"
                      value={editingContent.contact_info?.customer_service_email || ''}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        contact_info: {
                          ...editingContent.contact_info,
                          customer_service_email: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editingContent.contact_info?.whatsapp || ''}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        contact_info: {
                          ...editingContent.contact_info,
                          whatsapp: e.target.value
                        }
                      })}
                      placeholder="+62-xxx-xxxx-xxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Content Sections (simplified for now) */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Konten Tambahan</h4>
                <textarea
                  value={JSON.stringify(editingContent.content_sections, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setEditingContent({
                        ...editingContent,
                        content_sections: parsed
                      })
                    } catch (error) {
                      // Invalid JSON, ignore for now
                    }
                  }}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="JSON format untuk konten tambahan"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format JSON. Hati-hati saat mengedit untuk menghindari error.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setEditingContent(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => handleSave(editingContent)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}