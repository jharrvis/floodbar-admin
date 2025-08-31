'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Package, Mail, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Pembayaran Berhasil!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Terima kasih! Pembayaran Anda telah berhasil diproses dan pesanan sedang dipersiapkan.
          </p>

          {orderData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 mb-1">Order ID:</p>
              <p className="font-mono font-bold text-green-800 text-lg">
                #{orderData.id}
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package size={24} className="text-blue-600" />
              Detail Pesanan
            </h2>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700 mb-2">Informasi Customer</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Nama:</span> {orderData.customerName}</p>
                  <p><span className="font-medium">Email:</span> {orderData.customerEmail}</p>
                  <p><span className="font-medium">Telepon:</span> {orderData.customerPhone}</p>
                  <p><span className="font-medium">Alamat:</span> {orderData.customerAddress}, {orderData.customerCity} {orderData.customerPostalCode}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700 mb-2">Spesifikasi Produk</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Ukuran:</span> {orderData.productWidth}cm x {orderData.productHeight}cm</p>
                  <p><span className="font-medium">Ketebalan:</span> {orderData.productThickness}mm</p>
                  <p><span className="font-medium">Jumlah:</span> {orderData.productQuantity} pcs</p>
                  <p><span className="font-medium">Finishing:</span> {orderData.productFinish}</p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700 mb-2">Pengiriman</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Dari:</span> {orderData.shippingOrigin}</p>
                  <p><span className="font-medium">Ke:</span> {orderData.shippingDestination}</p>
                  <p><span className="font-medium">Layanan:</span> {orderData.shippingService}</p>
                  <p><span className="font-medium">Berat:</span> {orderData.shippingWeight}kg</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Ringkasan Pembayaran</h3>
                <div className="text-sm space-y-2">
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
                  <div className="flex justify-between border-t pt-2 font-semibold text-base">
                    <span>Total Dibayar:</span>
                    <span className="text-green-600">{formatCurrency(orderData.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Langkah Selanjutnya</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium">Konfirmasi Email</h3>
                <p className="text-sm text-gray-600">Invoice dan detail pesanan telah dikirim ke email Anda.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle size={20} className="text-green-600 mt-1" />
              <div>
                <h3 className="font-medium">Notifikasi WhatsApp</h3>
                <p className="text-sm text-gray-600">Tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi produksi.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package size={20} className="text-purple-600 mt-1" />
              <div>
                <h3 className="font-medium">Proses Produksi</h3>
                <p className="text-sm text-gray-600">Pesanan Anda akan segera diproses dan dikirim sesuai estimasi yang diberikan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link 
            href="/landing"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke Beranda
          </Link>
          
          <Link 
            href="/order"
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-6 rounded-lg transition-colors"
          >
            Buat Pesanan Baru
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Ada pertanyaan? Hubungi customer service kami</p>
          <p className="font-medium mt-1">customer@floodbar.com</p>
        </div>
      </div>
    </div>
  )
}