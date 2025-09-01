'use client'

import { useState, useEffect } from 'react'
import { XCircle, RefreshCw, ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function PaymentFailurePage() {
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    // Get order ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const externalId = urlParams.get('external_id')
    const orderId = externalId?.replace('floodbar-', '') || null

    if (orderId) {
      fetchOrderData(orderId)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`)
      const result = await response.json()
      
      if (result.success) {
        setOrderData(result.order)
      }
    } catch (error) {
      console.error('Error fetching order data:', error)
    } finally {
      setLoading(false)
    }
  }

  const retryPayment = async () => {
    if (!orderData) return
    
    setRetrying(true)
    try {
      // Generate new Xendit invoice for the same order
      const response = await fetch('/api/payment/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.id })
      })

      const result = await response.json()
      
      if (result.success && result.paymentUrl) {
        // Redirect to new payment URL
        window.location.href = result.paymentUrl
      } else {
        alert('Gagal membuat ulang link pembayaran. Silakan hubungi customer service.')
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
      alert('Terjadi kesalahan saat mencoba lagi. Silakan hubungi customer service.')
    } finally {
      setRetrying(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Failure Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Pembayaran Gagal
          </h1>
          
          <p className="text-gray-600 mb-6">
            Maaf, pembayaran Anda tidak dapat diproses. Jangan khawatir, pesanan Anda masih tersimpan.
          </p>

          {orderData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 mb-1">Order ID:</p>
              <p className="font-mono font-bold text-red-800 text-lg">
                #{orderData.id}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Status: {orderData.status === 'pending' ? 'Menunggu Pembayaran' : orderData.status}
              </p>
            </div>
          )}

          {/* Retry Payment Button */}
          {orderData && (
            <button
              onClick={retryPayment}
              disabled={retrying}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Memproses...' : 'Coba Bayar Lagi'}
            </button>
          )}
        </div>

        {/* Possible Reasons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kemungkinan Penyebab</h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <p>Dana di kartu kredit atau rekening tidak mencukupi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <p>Kartu kredit sudah kadaluarsa atau diblokir</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <p>Koneksi internet terputus selama proses pembayaran</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <p>Sesi pembayaran sudah kadaluarsa (lebih dari 24 jam)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <p>Pembayaran dibatalkan sebelum selesai</p>
            </div>
          </div>
        </div>

        {/* Order Summary (if available) */}
        {orderData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Produk FloodBar Custom</span>
                <span>{orderData.productWidth}cm x {orderData.productHeight}cm</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah:</span>
                <span>{orderData.productQuantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span>{formatCurrency(orderData.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Admin:</span>
                <span>{formatCurrency(orderData.adminFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold text-base">
                <span>Total yang Harus Dibayar:</span>
                <span className="text-red-600">{formatCurrency(orderData.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Payment Options */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Opsi Pembayaran Alternatif</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <MessageCircle size={20} className="text-green-600 mt-1" />
              <div>
                <h3 className="font-medium">Transfer Bank Manual</h3>
                <p className="text-sm text-gray-600">Hubungi customer service untuk mendapatkan rekening tujuan transfer manual.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Mail size={20} className="text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium">Bantuan via Email</h3>
                <p className="text-sm text-gray-600">Kirim email dengan Order ID Anda untuk mendapatkan bantuan pembayaran.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link 
            href="/order"
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Buat Pesanan Baru
          </Link>
          
          <Link 
            href="/landing"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Butuh bantuan? Hubungi customer service kami</p>
          <p className="font-medium mt-1">customer@floodbar.com | WhatsApp: +62-xxx-xxxx-xxxx</p>
        </div>
      </div>
    </div>
  )
}