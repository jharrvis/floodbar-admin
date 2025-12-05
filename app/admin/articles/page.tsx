'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
})

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl: string | null
  author: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean']
  ]
}

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'link', 'image',
  'blockquote', 'code-block'
]

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    author: '',
    isPublished: false
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?published=false')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setArticles(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles'
      const method = editingArticle ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchArticles()
          resetForm()
          alert(editingArticle ? 'Artikel berhasil diperbarui!' : 'Artikel berhasil ditambahkan!')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl || '',
      author: article.author,
      isPublished: article.isPublished
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return

    try {
      const response = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchArticles()
        alert('Artikel berhasil dihapus!')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const togglePublish = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !article.isPublished })
      })

      if (response.ok) {
        await fetchArticles()
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      author: '',
      isPublished: false
    })
    setEditingArticle(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Tambah Artikel</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Artikel
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
                  Ringkasan (Excerpt)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24"
                  placeholder="Ringkasan singkat artikel untuk ditampilkan di halaman list..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Artikel
                </label>
                <div className="bg-white border border-gray-300 rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({...formData, content: value})}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-64"
                    placeholder="Tulis konten artikel di sini..."
                  />
                </div>
                <div className="h-12"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar (Opsional)
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
                  Penulis
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Nama penulis"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publish (tampil di website)
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (editingArticle ? 'Perbarui' : 'Simpan')}
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artikel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penulis
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
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {article.imageUrl && (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{article.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(article.createdAt)}</div>
                    {article.publishedAt && (
                      <div className="text-xs text-gray-500">
                        Publish: {formatDate(article.publishedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublish(article)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        article.isPublished 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {article.isPublished ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={`/artikel/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat artikel"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
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

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Belum ada artikel</p>
            <p className="text-gray-400 text-sm mt-2">Klik "Tambah Artikel" untuk menambahkan artikel pertama</p>
          </div>
        )}
      </div>
    </div>
  )
}
