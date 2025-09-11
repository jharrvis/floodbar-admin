'use client'

import { useState } from 'react'
import { Search, Package, Clock, CheckCircle, Truck, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface OrderStatus {
  orderId: string
  status: string
  statusLabel: string
  statusColor: string
  orderDate: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shipping: {
    destination: string
    estimatedDelivery: string
    trackingNumber?: string
    courier?: string
  }
  payment: {
    method: string
    status: string
    amount: number
  }
  timeline: Array<{
    date: string
    status: string
    description: string
    completed: boolean
  }>
}

export default function OrderStatusPage() {
  const [orderCode, setOrderCode] = useState('')
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchOrder = async () => {
    if (!orderCode.trim()) {
      setError('Masukkan kode pesanan')
      return
    }

    setLoading(true)
    setError('')
    setOrderStatus(null)

    try {
      const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderCode)}`)
      const result = await response.json()

      if (result.success && result.order) {
        // Map status to display format
        const statusMap: { [key: string]: { label: string, color: string } } = {
          'pending': { label: 'Menunggu Pembayaran', color: 'text-yellow-400' },
          'paid': { label: 'Sedang Diproduksi', color: 'text-blue-400' },
          'processing': { label: 'Dalam Produksi', color: 'text-blue-400' },
          'shipped': { label: 'Dikirim', color: 'text-green-400' },
          'delivered': { label: 'Selesai', color: 'text-green-400' },
          'cancelled': { label: 'Dibatalkan', color: 'text-red-400' }
        }

        const statusInfo = statusMap[result.order.status] || { label: result.order.status, color: 'text-gray-400' }
        
        const timeline = [
          {
            date: result.order.createdAt,
            status: 'Order Created',
            description: 'Pesanan berhasil dibuat',
            completed: true
          },
          {
            date: result.order.paidAt || '',
            status: 'Payment Confirmed',
            description: 'Pembayaran berhasil dikonfirmasi',
            completed: result.order.status !== 'pending'
          },
          {
            date: result.order.processingAt || '',
            status: 'Production Started',
            description: 'Produksi FloodBar custom dimulai',
            completed: ['processing', 'shipped', 'delivered'].includes(result.order.status)
          },
          {
            date: result.order.shippedAt || '',
            status: 'Shipped',
            description: 'Pesanan telah dikirim',
            completed: ['shipped', 'delivered'].includes(result.order.status)
          },
          {
            date: result.order.deliveredAt || '',
            status: 'Delivered',
            description: 'Pesanan telah diterima',
            completed: result.order.status === 'delivered'
          }
        ]

        setOrderStatus({
          orderId: result.order.orderId,
          status: result.order.status,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          orderDate: new Date(result.order.createdAt).toLocaleDateString('id-ID'),
          customerName: result.order.customerName,
          customerEmail: result.order.customerEmail,
          items: [{
            name: `FloodBar ${result.order.productConfig?.model || 'Custom'} ${result.order.productConfig?.width}cm x ${result.order.productConfig?.height}cm`,
            quantity: result.order.productConfig?.quantity || 1,
            price: result.order.orderSummary?.grandTotal || 0
          }],
          shipping: {
            destination: result.order.shipping?.destination || result.order.customerCity || '',
            estimatedDelivery: result.order.estimatedDelivery || '7-14 hari kerja',
            trackingNumber: result.order.trackingNumber,
            courier: result.order.courier
          },
          payment: {
            method: result.order.paymentMethod === 'xendit' ? 'Pembayaran Online' : result.order.paymentMethod,
            status: result.order.status === 'pending' ? 'Belum Dibayar' : 'Lunas',
            amount: result.order.orderSummary?.grandTotal || 0
          },
          timeline
        })
      } else {
        setError('Pesanan tidak ditemukan. Periksa kembali kode pesanan Anda.')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Terjadi kesalahan saat mencari pesanan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />
      case 'paid':
      case 'processing':
        return <Package className="w-6 h-6" />
      case 'shipped':
        return <Truck className="w-6 h-6" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />
      default:
        return <Clock className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white px-4 py-3 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">FloodBar.id</span>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowLeft size={16} />
              Kembali
            </button>
          </Link>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cek Status Pesanan FloodBar
            </h1>
            <p className="text-lg text-gray-300">
              Masukkan kode pesanan untuk melihat status pre-order FloodBar custom Anda
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-white mb-3">
                  Kode Pesanan
                </label>
                <input
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="Contoh: FLB-1757416920165-DOEMXSB8Q"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={searchOrder}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-3 disabled:opacity-50 font-semibold transition-all transform hover:scale-105 disabled:transform-none"
                >
                  <Search size={20} />
                  {loading ? 'Mencari...' : 'Cek Status'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <div className="text-red-300">{error}</div>
              </div>
            )}
          </div>

          {/* Order Status Results */}
          {orderStatus && (
            <div className="space-y-8">
              {/* Order Header */}
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Order #{orderStatus.orderId}
                    </h2>
                    <p className="text-gray-300">
                      Tanggal: {orderStatus.orderDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className={orderStatus.statusColor}>
                      {getStatusIcon(orderStatus.status)}
                    </div>
                    <span className={`text-xl font-bold ${orderStatus.statusColor}`}>
                      {orderStatus.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Pelanggan</h3>
                    <p className="text-gray-300">{orderStatus.customerName}</p>
                    <p className="text-gray-400 text-sm">{orderStatus.customerEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Pengiriman</h3>
                    <p className="text-gray-300">{orderStatus.shipping.destination}</p>
                    <p className="text-gray-400 text-sm">Estimasi: {orderStatus.shipping.estimatedDelivery}</p>
                    {orderStatus.shipping.trackingNumber && (
                      <p className="text-blue-400 text-sm">
                        Resi: {orderStatus.shipping.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Pembayaran</h3>
                    <p className="text-gray-300">{orderStatus.payment.method}</p>
                    <p className="text-gray-400 text-sm">{orderStatus.payment.status}</p>
                    <p className="text-blue-400 font-bold">
                      Rp {orderStatus.payment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Detail Produk</h3>
                <div className="space-y-4">
                  {orderStatus.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-gray-400">Quantity: {item.quantity} unit</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">
                          Rp {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Timeline Pre-Order</h3>
                <div className="space-y-6">
                  {orderStatus.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          item.completed ? 'text-white' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </h4>
                        {item.date && (
                          <p className="text-gray-500 text-sm">
                            {new Date(item.date).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}