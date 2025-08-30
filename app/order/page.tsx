'use client'

import { useState, useEffect } from 'react'
import { Calculator, ShoppingCart, User, MapPin, CreditCard, Send, Package, Truck } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  width: number
  height: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ShippingCalculation {
  cost: number
  estimatedDays: string
  weight: number
}

interface CustomerData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

interface OrderSummary {
  subtotal: number
  shippingCost: number
  adminFee: number
  grandTotal: number
}

export default function OrderPage() {
  const [step, setStep] = useState(1) // 1: Product Config, 2: Shipping, 3: Customer Data, 4: Payment, 5: Confirmation
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [shippingData, setShippingData] = useState<ShippingCalculation | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shippingCost: 0,
    adminFee: 5000,
    grandTotal: 0
  })

  // Product configuration form
  const [productForm, setProductForm] = useState({
    width: '',
    height: '',
    thickness: '5',
    quantity: 1,
    finish: 'Standard'
  })
  const [calculating, setCalculating] = useState(false)

  // Shipping form
  const [shippingForm, setShippingForm] = useState({
    destinationCity: '',
    destinationProvince: '',
    weight: 0
  })
  const [shippingCalculating, setShippingCalculating] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  // Calculate product price when form changes
  const calculateProductPrice = async () => {
    if (!productForm.width || !productForm.height || !productForm.quantity) return

    setCalculating(true)
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: parseFloat(productForm.width),
          height: parseFloat(productForm.height)
        })
      })

      const result = await response.json()
      if (result.success) {
        const unitPrice = result.data.pricing.totalPrice
        const totalPrice = unitPrice * productForm.quantity
        
        const newItem: OrderItem = {
          id: '1',
          name: `FloodBar Custom ${productForm.width}cm x ${productForm.height}cm`,
          width: parseFloat(productForm.width),
          height: parseFloat(productForm.height),
          quantity: productForm.quantity,
          unitPrice,
          totalPrice
        }

        setOrderItems([newItem])
        setShippingForm({
          ...shippingForm,
          weight: result.data.shipping.finalWeight * productForm.quantity
        })
      }
    } catch (error) {
      console.error('Error calculating price:', error)
    } finally {
      setCalculating(false)
    }
  }

  // Calculate shipping cost
  const calculateShipping = async () => {
    if (!shippingForm.destinationCity || !shippingForm.weight) return

    setShippingCalculating(true)
    try {
      // Mock shipping calculation - replace with real API
      const estimatedCost = shippingForm.weight * 15000 // Rp 15,000 per kg
      const estimatedDays = '3-5 hari kerja'

      setShippingData({
        cost: estimatedCost,
        estimatedDays,
        weight: shippingForm.weight
      })
    } catch (error) {
      console.error('Error calculating shipping:', error)
    } finally {
      setShippingCalculating(false)
    }
  }

  // Update order summary whenever items or shipping changes
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const shippingCost = shippingData?.cost || 0
    const adminFee = 5000
    const grandTotal = subtotal + shippingCost + adminFee

    setOrderSummary({
      subtotal,
      shippingCost,
      adminFee,
      grandTotal
    })
  }, [orderItems, shippingData])

  const submitOrder = async () => {
    setSubmitting(true)
    try {
      // Transform data to match API expectations
      const firstItem = orderItems[0] // Assuming single product for now
      const orderData = {
        productConfig: {
          width: firstItem?.width || 0,
          height: firstItem?.height || 0,
          thickness: parseFloat(productForm.thickness) || 5,
          quantity: firstItem?.quantity || 1,
          finish: productForm.finish || 'Standard'
        },
        shipping: {
          origin: 'Jakarta', // Default origin
          destination: customerData.city,
          weight: shippingData?.weight || 1,
          service: 'REG',
          cost: shippingData?.cost || 0
        },
        customer: customerData,
        payment: {
          method: selectedPaymentMethod
        },
        orderSummary: orderSummary
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      if (result.success) {
        setStep(5) // Go to confirmation
      } else {
        alert('Gagal membuat order: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Terjadi kesalahan saat membuat order')
    } finally {
      setSubmitting(false)
    }
  }

  const OrderSidebar = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart size={20} />
        Ringkasan Pesanan
      </h3>
      
      {orderItems.length > 0 && (
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div key={item.id} className="border-b pb-3">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-gray-600">
                Quantity: {item.quantity} unit
              </p>
              <p className="text-sm font-medium">
                Rp {item.totalPrice.toLocaleString()}
              </p>
            </div>
          ))}
          
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp {orderSummary.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir:</span>
              <span>Rp {orderSummary.shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Admin:</span>
              <span>Rp {orderSummary.adminFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>Rp {orderSummary.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Buat Pesanan FloodBar</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-8">
            {[
              { num: 1, title: 'Produk', icon: Package },
              { num: 2, title: 'Pengiriman', icon: Truck },
              { num: 3, title: 'Data Diri', icon: User },
              { num: 4, title: 'Pembayaran', icon: CreditCard },
              { num: 5, title: 'Selesai', icon: Send }
            ].map((stepItem) => {
              const Icon = stepItem.icon
              return (
                <div key={stepItem.num} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= stepItem.num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= stepItem.num ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </span>
                  {stepItem.num < 5 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step > stepItem.num ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Step 1: Product Configuration */}
            {step === 1 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package size={24} />
                  Konfigurasi Produk
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lebar (cm)
                    </label>
                    <input
                      type="number"
                      value={productForm.width}
                      onChange={(e) => setProductForm({ ...productForm, width: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Masukkan lebar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tinggi (cm)
                    </label>
                    <input
                      type="number"
                      value={productForm.height}
                      onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Masukkan tinggi"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ketebalan (mm)
                    </label>
                    <select
                      value={productForm.thickness}
                      onChange={(e) => setProductForm({ ...productForm, thickness: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="3">3mm</option>
                      <option value="5">5mm</option>
                      <option value="8">8mm</option>
                      <option value="10">10mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finishing
                    </label>
                    <select
                      value={productForm.finish}
                      onChange={(e) => setProductForm({ ...productForm, finish: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Glossy">Glossy</option>
                      <option value="Matte">Matte</option>
                      <option value="Anti-UV">Anti-UV</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={calculateProductPrice}
                    disabled={calculating || !productForm.width || !productForm.height}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Calculator size={16} />
                    {calculating ? 'Menghitung...' : 'Hitung Harga'}
                  </button>
                  {orderItems.length > 0 && (
                    <button
                      onClick={() => setStep(2)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Lanjut ke Pengiriman
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Truck size={24} />
                  Pengiriman
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota Tujuan
                    </label>
                    <input
                      type="text"
                      value={shippingForm.destinationCity}
                      onChange={(e) => setShippingForm({ ...shippingForm, destinationCity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Contoh: Jakarta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={shippingForm.destinationProvince}
                      onChange={(e) => setShippingForm({ ...shippingForm, destinationProvince: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Contoh: DKI Jakarta"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Berat total: {shippingForm.weight} kg
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={calculateShipping}
                    disabled={shippingCalculating || !shippingForm.destinationCity}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {shippingCalculating ? 'Menghitung...' : 'Hitung Ongkir'}
                  </button>
                  {shippingData && (
                    <button
                      onClick={() => setStep(3)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Lanjut ke Data Diri
                    </button>
                  )}
                </div>
                {shippingData && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <p className="font-medium">Ongkos Kirim: Rp {shippingData.cost.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Estimasi: {shippingData.estimatedDays}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Data */}
            {step === 3 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User size={24} />
                  Data Diri & Alamat
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon *
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Contoh: 08123456789"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={customerData.city}
                      onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={customerData.province}
                      onChange={(e) => setCustomerData({ ...customerData, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={customerData.postalCode}
                      onChange={(e) => setCustomerData({ ...customerData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.address}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Lanjut ke Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {step === 4 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={24} />
                  Metode Pembayaran
                </h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'bank_transfer', name: 'Transfer Bank', desc: 'Transfer ke rekening bank' },
                    { id: 'virtual_account', name: 'Virtual Account', desc: 'BCA, Mandiri, BRI, BNI' },
                    { id: 'ewallet', name: 'E-Wallet', desc: 'OVO, GoPay, Dana, ShopeePay' },
                    { id: 'qris', name: 'QRIS', desc: 'Scan QR untuk pembayaran' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={!selectedPaymentMethod || submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {submitting ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-green-600 mb-2">
                    Pesanan Berhasil Dibuat!
                  </h2>
                  <p className="text-gray-600">
                    Invoice telah dikirim ke email Anda dan notifikasi WhatsApp akan segera dikirim.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p className="text-sm text-gray-600 mb-2">Order ID:</p>
                  <p className="font-mono font-bold text-lg">#ORD-{Date.now()}</p>
                </div>
                <button
                  onClick={() => window.location.href = '/landing'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <OrderSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}