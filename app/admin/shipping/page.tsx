'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Search, Trash2, Download, AlertCircle, CheckCircle, Clock, Edit2, X, Save } from 'lucide-react'

interface ShippingRate {
  id: string
  idHarga: string | null
  kodeJasa: string | null
  cakupan: string | null
  via: string | null
  tipe: string | null
  hargaOnline: number | null
  hargaPks: number | null
  asal: string | null
  tujuan: string
  wilayah: string | null
  updateDate: string | null
  jenis: string | null
  varian: string | null
  leadTime: string | null
  kodeNegara: string | null
  simbol: string | null
  nilaiTukar: number | null
  diskon: string | null
  createdAt: string
  updatedAt: string
}

interface UploadStats {
  processed: number
  added: number
  updated: number
  errors: number
  total: number
}

export default function ShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<ShippingRate>>({})
  const [editLoading, setEditLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limit = 50

  useEffect(() => {
    fetchRates()
  }, [page, search])

  const fetchRates = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/shipping-rates?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setRates(result.data)
        setTotal(result.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Hanya file CSV yang diizinkan')
      return
    }

    setUploading(true)
    setUploadProgress('Memproses file CSV...')
    setUploadStats(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/shipping-rates/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadProgress('Upload selesai!')
        setUploadStats(result.stats)
        fetchRates() // Refresh data
        setTimeout(() => {
          setUploadProgress('')
          setUploadStats(null)
        }, 10000)
      } else {
        alert(result.error || 'Gagal upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA data shipping rates? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      const response = await fetch('/api/shipping-rates?action=clear', {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        alert('Semua data berhasil dihapus')
        fetchRates()
      } else {
        alert(result.error || 'Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRates()
  }

  const handleEditClick = (rate: ShippingRate) => {
    setEditingRate(rate)
    setEditFormData({ ...rate })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRate) return

    setEditLoading(true)
    try {
      const response = await fetch('/api/shipping-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingRate.id,
          ...editFormData
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Data berhasil diupdate')
        setEditingRate(null)
        setEditFormData({})
        fetchRates() // Refresh data
      } else {
        alert(result.error || 'Gagal update data')
      }
    } catch (error) {
      console.error('Error updating rate:', error)
      alert('Terjadi kesalahan saat update')
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingRate(null)
    setEditFormData({})
  }

  const handleInputChange = (field: keyof ShippingRate, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }))
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Ongkir Indah Cargo</h1>
        
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </label>
          
          <button
            onClick={handleClearAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            disabled={uploading || loading}
          >
            <Trash2 size={16} />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {(uploadProgress || uploadStats) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {uploadProgress && (
            <div className="flex items-center gap-2 text-blue-800">
              <Clock size={16} className="animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}
          
          {uploadStats && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Total Processed</div>
                <div className="text-lg font-bold text-blue-600">{uploadStats.processed.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Added</div>
                <div className="text-lg font-bold text-green-600">{uploadStats.added.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Updated</div>
                <div className="text-lg font-bold text-yellow-600">{uploadStats.updated.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Errors</div>
                <div className="text-lg font-bold text-red-600">{uploadStats.errors.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Total Rows</div>
                <div className="text-lg font-bold text-gray-600">{uploadStats.total.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari berdasarkan tujuan, asal, atau jalur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            disabled={loading}
          >
            <Search size={16} />
            Cari
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total data: <strong>{total.toLocaleString()}</strong> shipping rates</span>
          <div className="text-sm text-gray-500">
            Halaman {page} dari {totalPages} • Menampilkan {rates.length} data
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tujuan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Via
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Online
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga PKS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wilayah
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <div className="mt-2 text-gray-500">Loading...</div>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rate.tujuan}</div>
                      <div className="text-sm text-gray-500">{rate.asal}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rate.via === 'DARAT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rate.via || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.hargaOnline ? `Rp ${rate.hargaOnline.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.hargaPks ? `Rp ${rate.hargaPks.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.leadTime || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {rate.wilayah || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(rate)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
          <div className="text-sm text-yellow-800">
            <div className="font-medium mb-2">Petunjuk Upload CSV:</div>
            <ul className="space-y-1 text-xs">
              <li>• File harus dalam format CSV dengan delimiter semicolon (;)</li>
              <li>• Struktur kolom harus sesuai dengan format Indah Cargo</li>
              <li>• Data yang sudah ada akan diupdate berdasarkan kombinasi Asal + Tujuan + Via</li>
              <li>• Data baru akan ditambahkan jika belum ada</li>
              <li>• Proses upload dapat memakan waktu beberapa menit untuk file besar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Shipping Rate</h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tujuan *
                    </label>
                    <input
                      type="text"
                      value={editFormData.tujuan || ''}
                      onChange={(e) => handleInputChange('tujuan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asal
                    </label>
                    <input
                      type="text"
                      value={editFormData.asal || ''}
                      onChange={(e) => handleInputChange('asal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Via
                    </label>
                    <select
                      value={editFormData.via || ''}
                      onChange={(e) => handleInputChange('via', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Via</option>
                      <option value="DARAT">DARAT</option>
                      <option value="LAUT">LAUT</option>
                      <option value="UDARA">UDARA</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe
                    </label>
                    <input
                      type="text"
                      value={editFormData.tipe || ''}
                      onChange={(e) => handleInputChange('tipe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Online
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.hargaOnline || ''}
                      onChange={(e) => handleInputChange('hargaOnline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga PKS
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.hargaPks || ''}
                      onChange={(e) => handleInputChange('hargaPks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time
                    </label>
                    <input
                      type="text"
                      value={editFormData.leadTime || ''}
                      onChange={(e) => handleInputChange('leadTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis
                    </label>
                    <input
                      type="text"
                      value={editFormData.jenis || ''}
                      onChange={(e) => handleInputChange('jenis', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Varian
                    </label>
                    <input
                      type="text"
                      value={editFormData.varian || ''}
                      onChange={(e) => handleInputChange('varian', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Negara
                    </label>
                    <input
                      type="text"
                      value={editFormData.kodeNegara || ''}
                      onChange={(e) => handleInputChange('kodeNegara', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Simbol
                    </label>
                    <input
                      type="text"
                      value={editFormData.simbol || ''}
                      onChange={(e) => handleInputChange('simbol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Tukar
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editFormData.nilaiTukar || ''}
                      onChange={(e) => handleInputChange('nilaiTukar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wilayah
                  </label>
                  <textarea
                    value={editFormData.wilayah || ''}
                    onChange={(e) => handleInputChange('wilayah', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diskon
                  </label>
                  <input
                    type="text"
                    value={editFormData.diskon || ''}
                    onChange={(e) => handleInputChange('diskon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {editLoading ? (
                      <Clock size={16} className="animate-spin mr-2" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}