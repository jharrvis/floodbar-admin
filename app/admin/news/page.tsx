'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react'

interface News {
  id: string
  title: string
  summary: string
  imageUrl: string
  sourceUrl: string
  sourceName: string
  publishedAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    imageUrl: '',
    sourceUrl: '',
    sourceName: '',
    publishedAt: new Date().toISOString().split('T')[0],
    isActive: true
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?active=false')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setNews(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news'
      const method = editingNews ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchNews()
          resetForm()
          alert(editingNews ? 'Berita berhasil diperbarui!' : 'Berita berhasil ditambahkan!')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      summary: newsItem.summary,
      imageUrl: newsItem.imageUrl,
      sourceUrl: newsItem.sourceUrl,
      sourceName: newsItem.sourceName,
      publishedAt: new Date(newsItem.publishedAt).toISOString().split('T')[0],
      isActive: newsItem.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return

    try {
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchNews()
        alert('Berita berhasil dihapus!')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      imageUrl: '',
      sourceUrl: '',
      sourceName: '',
      publishedAt: new Date().toISOString().split('T')[0],
      isActive: true
    })
    setEditingNews(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Tambah Berita</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Berita
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ringkasan Berita
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Sumber Berita
                </label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Sumber
                </label>
                <input
                  type="text"
                  value={formData.sourceName}
                  onChange={(e) => setFormData({...formData, sourceName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Contoh: Kompas.com, Detik.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Publish
                </label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({...formData, publishedAt: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Aktif (tampil di website)
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (editingNews ? 'Perbarui' : 'Simpan')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Berita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sumber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.sourceName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(item.publishedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Nonaktif
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat sumber"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Belum ada berita</p>
            <p className="text-gray-400 text-sm mt-2">Klik "Tambah Berita" untuk menambahkan berita pertama</p>
          </div>
        )}
      </div>
    </div>
  )
}