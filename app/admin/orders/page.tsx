'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  Truck,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Square,
  CheckSquare
} from 'lucide-react'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerPostalCode: string
  productWidth: number
  productHeight: number
  productThickness: number
  productQuantity: number
  productFinish: string
  shippingOrigin: string
  shippingDestination: string
  shippingWeight: number
  shippingService: string
  shippingCost: number
  paymentMethod: string
  paymentProvider: string
  subtotal: number
  adminFee: number
  grandTotal: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  isChecked?: boolean
  xenditInvoiceId?: string
  xenditInvoiceUrl?: string
  trackingNumber?: string
  shippedAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800', 
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  pending: 'Menunggu',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim', 
  delivered: 'Diterima',
  cancelled: 'Dibatalkan',
  failed: 'Gagal',
  refunded: 'Refund'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [syncingOrders, setSyncingOrders] = useState<Set<string>>(new Set())
  const [shippingOrders, setShippingOrders] = useState<Set<string>>(new Set())
  const [showWebhookDebug, setShowWebhookDebug] = useState(false)
  const [webhookDebugData, setWebhookDebugData] = useState<any>(null)
  
  // New state for enhanced features
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [allOrders, setAllOrders] = useState<Order[]>([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders')
      const result = await response.json()
      
      if (result.success) {
        console.log('Orders loaded:', result.orders.slice(0, 2)) // Debug first 2 orders
        setAllOrders(result.orders)
        setOrders(result.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        loadOrders() // Reload orders
        alert('Status pesanan berhasil diupdate')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Gagal mengupdate status pesanan')
    }
  }

  const syncOrderStatus = async (orderId: string) => {
    // Add to syncing set
    setSyncingOrders(prev => new Set(prev).add(orderId))
    
    try {
      const response = await fetch('/api/admin/orders/sync-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const result = await response.json()
      
      if (result.success) {
        if (result.synced) {
          let message = 'Status berhasil disinkronkan:'
          if (result.previousStatus !== result.currentStatus) {
            message += `\nStatus pesanan: ${result.previousStatus} → ${result.currentStatus}`
          }
          if (result.previousPaymentStatus !== result.currentPaymentStatus) {
            message += `\nStatus pembayaran: ${result.previousPaymentStatus} → ${result.currentPaymentStatus}`
          }
          alert(message)
          loadOrders() // Reload to show updated status
        } else {
          alert(result.message || 'Status sudah up to date')
        }
      } else {
        alert('Gagal sinkronisasi status: ' + result.error)
      }
    } catch (error) {
      console.error('Error syncing order status:', error)
      alert('Terjadi kesalahan saat sinkronisasi status')
    } finally {
      // Remove from syncing set
      setSyncingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const loadWebhookDebug = async () => {
    try {
      const response = await fetch('/api/admin/webhook-debug')
      if (response.ok) {
        const data = await response.json()
        setWebhookDebugData(data)
        setShowWebhookDebug(true)
      }
    } catch (error) {
      console.error('Error loading webhook debug:', error)
    }
  }

  const markAsShipped = async (orderId: string, trackingNumber: string) => {
    // Add to shipping set
    setShippingOrders(prev => new Set(prev).add(orderId))
    
    try {
      const response = await fetch('/api/admin/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Pesanan berhasil ditandai sebagai dikirim! Notifikasi email telah dikirim ke pelanggan.`)
        loadOrders() // Reload to show updated status
        setShowShippingModal(false)
        setTrackingNumber('')
        setSelectedOrder(null)
      } else {
        alert('Gagal menandai pesanan sebagai dikirim: ' + result.error)
      }
    } catch (error) {
      console.error('Error marking order as shipped:', error)
      alert('Terjadi kesalahan saat menandai pesanan sebagai dikirim')
    } finally {
      // Remove from shipping set
      setShippingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const openShippingModal = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNumber('')
    setShowShippingModal(true)
  }

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...allOrders]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search)
      )
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    // Apply payment filter
    if (paymentFilter) {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter)
    }
    
    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(dateFrom + 'T00:00:00')
      )
    }
    
    if (dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''
      
      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      } else if (sortBy === 'updatedAt') {
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
      } else if (sortBy === 'grandTotal') {
        aValue = a.grandTotal || 0
        bValue = b.grandTotal || 0
      } else if (sortBy === 'id') {
        aValue = a.id || ''
        bValue = b.id || ''
      } else if (sortBy === 'status') {
        aValue = a.status || ''
        bValue = b.status || ''
      } else if (sortBy === 'paymentStatus') {
        aValue = a.paymentStatus || ''
        bValue = b.paymentStatus || ''
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [allOrders, search, statusFilter, paymentFilter, dateFrom, dateTo, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = orders.slice(startIndex, endIndex)

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const toggleCheckedStatus = async (orderId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/toggle-checked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChecked: !currentStatus })
      })

      if (response.ok) {
        // Update local state
        setAllOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, isChecked: !currentStatus }
            : order
        ))

        // Dispatch custom event to notify sidebar of the change
        window.dispatchEvent(new CustomEvent('orderCheckedStatusChanged', {
          detail: { 
            orderId, 
            isChecked: !currentStatus,
            // Send updated unchecked count
            uncheckedCount: allOrders.filter(order => 
              order.id === orderId ? !currentStatus : !order.isChecked
            ).length
          }
        }))
      } else {
        console.error('Failed to update checked status')
        alert('Gagal mengupdate status cek')
      }
    } catch (error) {
      console.error('Error toggling checked status:', error)
      alert('Terjadi kesalahan saat mengupdate status cek')
    }
  }

  // Get unchecked orders count for notification badge
  const getUncheckedOrdersCount = () => {
    return allOrders.filter(order => !order.isChecked).length
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase()
    
    if (methodLower.includes('credit') || methodLower.includes('debit') || methodLower.includes('card')) {
      return <CreditCard size={16} className="text-blue-600" />
    }
    if (methodLower.includes('bank') || methodLower.includes('transfer') || methodLower.includes('virtual_account')) {
      return <Building2 size={16} className="text-green-600" />
    }
    if (methodLower.includes('ewallet') || methodLower.includes('ovo') || methodLower.includes('dana') || methodLower.includes('gopay') || methodLower.includes('linkaja')) {
      return <Smartphone size={16} className="text-purple-600" />
    }
    if (methodLower.includes('qris') || methodLower.includes('qr')) {
      return <QrCode size={16} className="text-orange-600" />
    }
    return <DollarSign size={16} className="text-gray-600" />
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodLower = method.toLowerCase()
    
    if (methodLower.includes('credit')) return 'Credit Card'
    if (methodLower.includes('debit')) return 'Debit Card' 
    if (methodLower.includes('bank_transfer')) return 'Bank Transfer'
    if (methodLower.includes('virtual_account')) return 'Virtual Account'
    if (methodLower.includes('ovo')) return 'OVO'
    if (methodLower.includes('dana')) return 'DANA'
    if (methodLower.includes('gopay')) return 'GoPay'
    if (methodLower.includes('linkaja')) return 'LinkAja'
    if (methodLower.includes('ewallet')) return 'E-Wallet'
    if (methodLower.includes('qris')) return 'QRIS'
    return method
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Memuat data pesanan...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-600 mt-1">Pantau dan kelola semua pesanan pelanggan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadWebhookDebug}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            title="Debug Webhook"
          >
            <RefreshCw size={16} />
            Debug Webhook
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        {/* First Row - Main Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari pesanan, nama, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status Pesanan</option>
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="shipped">Dikirim</option>
            <option value="delivered">Diterima</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status Pembayaran</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Sudah Dibayar</option>
            <option value="failed">Gagal</option>
            <option value="refunded">Refund</option>
          </select>
        </div>

        {/* Second Row - Date Filters and Clear Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              placeholder="Tanggal Mulai"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              placeholder="Tanggal Akhir"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setPaymentFilter('')
              setDateFrom('')
              setDateTo('')
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Filter size={16} />
            Clear Filters
          </button>

          <div className="flex items-center text-sm text-gray-500">
            Filter aktif: {[search, statusFilter, paymentFilter, dateFrom, dateTo].filter(Boolean).length}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 flex items-center gap-4">
            <span>Total: {orders.length} pesanan</span>
            {getUncheckedOrdersCount() > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {getUncheckedOrdersCount()} transaksi belum dicek
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per halaman</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Order ID & Customer
                    {sortBy === 'id' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('grandTotal')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Total
                    {sortBy === 'grandTotal' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Status Pesanan
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('paymentStatus')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Pembayaran
                    {sortBy === 'paymentStatus' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Tanggal
                    {sortBy === 'createdAt' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Cek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.grandTotal)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {getPaymentMethodIcon(order.paymentMethod)}
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        if (e.target.value === 'shipped') {
                          openShippingModal(order)
                        } else {
                          updateOrderStatus(order.id, e.target.value)
                        }
                      }}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${statusColors[order.status]}`}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="processing">Diproses</option>
                      <option value="shipped">Dikirim</option>
                      <option value="delivered">Diterima</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                    {order.trackingNumber && (
                      <div className="text-xs text-gray-500 mt-1">
                        Resi: {order.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.paymentStatus]}`}>
                      {statusLabels[order.paymentStatus]}
                    </span>
                    {order.paidAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(order.paidAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleCheckedStatus(order.id, order.isChecked || false)}
                      className={`inline-flex items-center justify-center p-1 rounded transition-colors ${
                        order.isChecked 
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title={order.isChecked ? 'Tandai belum dicek' : 'Tandai sudah dicek'}
                    >
                      {order.isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowDetailModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {(order.paymentMethod === 'xendit' || order.paymentMethod === 'online' || order.paymentProvider === 'xendit') && (
                        <button
                          onClick={() => syncOrderStatus(order.id)}
                          disabled={syncingOrders.has(order.id)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sinkronisasi Status Pembayaran"
                        >
                          <RefreshCw size={16} className={syncingOrders.has(order.id) ? 'animate-spin' : ''} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' '}sampai{' '}
                <span className="font-medium">{Math.min(endIndex, orders.length)}</span>
                {' '}dari{' '}
                <span className="font-medium">{orders.length}</span>
                {' '}hasil
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber: number
                  if (totalPages <= 7) {
                    pageNumber = i + 1
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i
                  } else {
                    pageNumber = currentPage - 3 + i
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Belum ada pesanan yang masuk atau sesuai dengan filter.
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detail Pesanan {selectedOrder.id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} /> Informasi Customer
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nama:</span> {selectedOrder.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedOrder.customerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Telepon:</span> {selectedOrder.customerPhone}
                  </div>
                  <div>
                    <span className="font-medium">Kota:</span> {selectedOrder.customerCity}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Alamat:</span> {selectedOrder.customerAddress}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={16} /> Informasi Produk
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Ukuran:</span> {selectedOrder.productWidth}×{selectedOrder.productHeight}cm
                  </div>
                  <div>
                    <span className="font-medium">Ketebalan:</span> {selectedOrder.productThickness}mm
                  </div>
                  <div>
                    <span className="font-medium">Jumlah:</span> {selectedOrder.productQuantity} pcs
                  </div>
                  <div>
                    <span className="font-medium">Finishing:</span> {selectedOrder.productFinish}
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Truck size={16} /> Informasi Pengiriman
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Asal:</span> {selectedOrder.shippingOrigin}
                  </div>
                  <div>
                    <span className="font-medium">Tujuan:</span> {selectedOrder.shippingDestination}
                  </div>
                  <div>
                    <span className="font-medium">Berat:</span> {selectedOrder.shippingWeight}kg
                  </div>
                  <div>
                    <span className="font-medium">Layanan:</span> {selectedOrder.shippingService}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Ongkir:</span> {formatCurrency(selectedOrder.shippingCost)}
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="col-span-2 border-t pt-2">
                      <span className="font-medium">Nomor Resi:</span> 
                      <span className="ml-2 bg-blue-50 px-2 py-1 rounded font-mono text-sm">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                  {selectedOrder.shippedAt && (
                    <div className="col-span-2">
                      <span className="font-medium">Tanggal Kirim:</span> {formatDate(selectedOrder.shippedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign size={16} /> Informasi Pembayaran
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Subtotal:</span> {formatCurrency(selectedOrder.subtotal)}
                  </div>
                  <div>
                    <span className="font-medium">Biaya Admin:</span> {formatCurrency(selectedOrder.adminFee)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Metode:</span> 
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                    {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusColors[selectedOrder.paymentStatus]}`}>
                      {statusLabels[selectedOrder.paymentStatus]}
                    </span>
                  </div>
                  <div className="col-span-2 border-t pt-2">
                    <span className="font-medium text-lg">Total: {formatCurrency(selectedOrder.grandTotal)}</span>
                  </div>
                  {selectedOrder.xenditInvoiceUrl && (
                    <div className="col-span-2">
                      <a 
                        href={selectedOrder.xenditInvoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Lihat Invoice Xendit
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Truck size={20} className="text-blue-600" />
                Tandai Sebagai Dikirim
              </h3>
              <button
                onClick={() => {
                  setShowShippingModal(false)
                  setTrackingNumber('')
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Detail Pesanan</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Pelanggan:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Tujuan:</strong> {selectedOrder.customerCity}</p>
                  <p><strong>Layanan:</strong> {selectedOrder.shippingService}</p>
                </div>
              </div>

              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Resi Pengiriman *
                </label>
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Masukkan nomor resi pengiriman"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor resi akan dikirimkan ke email pelanggan secara otomatis
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowShippingModal(false)
                  setTrackingNumber('')
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!trackingNumber.trim()) {
                    alert('Mohon masukkan nomor resi pengiriman')
                    return
                  }
                  markAsShipped(selectedOrder.id, trackingNumber.trim())
                }}
                disabled={shippingOrders.has(selectedOrder.id) || !trackingNumber.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {shippingOrders.has(selectedOrder.id) ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    Tandai Dikirim & Kirim Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Debug Modal */}
      {showWebhookDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Webhook Debug Info</h3>
              <button
                onClick={() => setShowWebhookDebug(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {webhookDebugData && (
              <div className="space-y-6">
                {/* Configuration Info */}
                <div>
                  <h4 className="font-medium mb-2">Konfigurasi Webhook</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Webhook Token:</span> 
                        <span className={webhookDebugData.settings.webhookTokenConfigured ? 'text-green-600' : 'text-red-600'}>
                          {webhookDebugData.settings.webhookTokenConfigured ? ' ✓ Terkonfigurasi' : ' ✗ Belum dikonfigurasi'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Xendit Enabled:</span> 
                        <span className={webhookDebugData.settings.xenditEnabled ? 'text-green-600' : 'text-red-600'}>
                          {webhookDebugData.settings.xenditEnabled ? ' ✓ Aktif' : ' ✗ Tidak aktif'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Webhook URL:</span> 
                        <span className="text-blue-600 break-all"> {webhookDebugData.settings.webhookUrl}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Webhooks */}
                <div>
                  <h4 className="font-medium mb-2">Log Webhook Terbaru ({webhookDebugData.webhookLogs.length})</h4>
                  <div className="bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    {webhookDebugData.webhookLogs.length > 0 ? (
                      <div className="divide-y">
                        {webhookDebugData.webhookLogs.map((log: any, index: number) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm">
                                <span className="font-medium">Order: {log.orderId}</span>
                                <span className="text-gray-500 ml-2">({log.provider})</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.processedAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-xs bg-white p-2 rounded border overflow-x-auto">
                              <pre>{JSON.stringify(JSON.parse(log.webhookData), null, 2)}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Belum ada log webhook ditemukan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}