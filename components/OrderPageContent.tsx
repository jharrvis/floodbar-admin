'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  insuranceCost?: number
  pickupCost?: number
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
  grandTotal: number
}

export default function OrderPageContent() {
  const searchParams = useSearchParams()
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
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shippingCost: 0,
    grandTotal: 0
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Form states untuk step 1 (Product Configuration)
  const [productForm, setProductForm] = useState({
    model: '',
    width: '',
    height: '',
    quantity: '1'
  })

  // Form states untuk step 2 (Shipping)
  const [shippingForm, setShippingForm] = useState({
    origin: 'Jakarta',
    destination: '',
    service: '',
    cost: 0,
    weight: 0,
    includeInsurance: false,
    includePickup: false
  })

  const [calculation, setCalculation] = useState<any>(null)
  const [shippingOptions, setShippingOptions] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Check for model parameter from URL
  useEffect(() => {
    const model = searchParams.get('model')
    if (model && (model === 'Model A' || model === 'Model B')) {
      setProductForm(prev => ({ ...prev, model }))
    }
  }, [searchParams])

  // Calculate price when form changes
  const handleCalculate = async () => {
    if (!productForm.width || !productForm.height || !productForm.quantity) {
      alert('Harap lengkapi semua field produk')
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width: parseFloat(productForm.width),
          height: parseFloat(productForm.height),
          includePickup: shippingForm.includePickup,
          includeInsurance: shippingForm.includeInsurance
        })
      })

      if (!response.ok) {
        throw new Error('Gagal menghitung harga')
      }

      const result = await response.json()
      if (result.success) {
        setCalculation(result.data)
        
        // Round up the weight as requested
        const roundedWeight = Math.ceil(result.data.shipping.finalWeight)
        const shippingWeight = Math.max(roundedWeight, 10) // Apply 10kg minimum for billing
        
        setShippingForm(prev => ({ 
          ...prev, 
          weight: result.data.shipping.finalWeight // Keep actual weight for display
        }))

        // Create order item
        const quantity = parseInt(productForm.quantity)
        const orderItem: OrderItem = {
          id: '1',
          name: `FloodBar ${productForm.model}`,
          width: parseFloat(productForm.width),
          height: parseFloat(productForm.height),
          quantity: quantity,
          unitPrice: result.data.pricing.totalPrice,
          totalPrice: result.data.pricing.totalPrice * quantity
        }

        setOrderItems([orderItem])
        setOrderSummary(prev => ({
          ...prev,
          subtotal: orderItem.totalPrice
        }))

        alert('Harga berhasil dihitung! Lanjutkan ke pengiriman.')
      } else {
        throw new Error(result.error || 'Gagal menghitung harga')
      }
    } catch (error) {
      console.error('Error calculating price:', error)
      alert('Terjadi kesalahan saat menghitung harga')
    } finally {
      setIsCalculating(false)
    }
  }

  // Calculate shipping
  const handleCalculateShipping = async () => {
    if (!shippingForm.destination) {
      alert('Harap pilih kota tujuan')
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: shippingForm.origin,
          destination: shippingForm.destination,
          weight: Math.max(Math.ceil(shippingForm.weight), 10) // Use rounded up weight for billing
        })
      })

      if (!response.ok) {
        throw new Error('Gagal menghitung ongkir')
      }

      const result = await response.json()
      if (result.success) {
        setShippingOptions(result.data)
        alert('Pilihan pengiriman tersedia')
      } else {
        throw new Error(result.error || 'Gagal menghitung ongkir')
      }
    } catch (error) {
      console.error('Error calculating shipping:', error)
      alert('Terjadi kesalahan saat menghitung ongkir')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleShippingSelect = (option: any) => {
    const roundedWeight = Math.ceil(shippingForm.weight)
    const shippingWeight = Math.max(roundedWeight, 10)
    
    setShippingForm(prev => ({
      ...prev,
      service: option.service,
      cost: option.cost
    }))

    setShippingData({
      cost: option.cost,
      estimatedDays: option.estimatedDays,
      weight: shippingWeight // Use billing weight
    })

    setOrderSummary(prev => ({
      ...prev,
      shippingCost: option.cost,
      grandTotal: prev.subtotal + option.cost
    }))
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!productForm.model || !productForm.width || !productForm.height || !calculation) {
        alert('Harap lengkapi konfigurasi produk dan hitung harga terlebih dahulu')
        return
      }
    } else if (step === 2) {
      if (!shippingData) {
        alert('Harap pilih metode pengiriman terlebih dahulu')
        return
      }
    } else if (step === 3) {
      if (!customerData.name || !customerData.email || !customerData.phone || !customerData.address) {
        alert('Harap lengkapi data pelanggan')
        return
      }
    } else if (step === 4) {
      if (!selectedPaymentMethod) {
        alert('Harap pilih metode pembayaran')
        return
      }
    }

    setStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmitOrder = async () => {
    setIsProcessing(true)
    try {
      // Transform data to match API expectations
      const firstItem = orderItems[0] // Assuming single product for now
      const orderData = {
        productConfig: {
          model: productForm.model,
          width: firstItem?.width || parseFloat(productForm.width),
          height: firstItem?.height || parseFloat(productForm.height),
          thickness: 5,
          quantity: firstItem?.quantity || parseInt(productForm.quantity),
          finish: 'Standard'
        },
        shipping: {
          origin: 'Jakarta',
          destination: customerData.city,
          weight: shippingData?.weight || Math.max(Math.ceil(shippingForm.weight), 10),
          service: shippingForm.service || 'REG',
          cost: shippingData?.cost || shippingForm.cost
        },
        customer: customerData,
        payment: {
          method: selectedPaymentMethod
        },
        orderSummary: orderSummary
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Gagal membuat pesanan')
      }

      const result = await response.json()
      if (result.success) {
        // Redirect to payment or confirmation page
        window.location.href = result.paymentUrl || '/order-confirmation'
      } else {
        throw new Error(result.error || 'Gagal membuat pesanan')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Terjadi kesalahan saat membuat pesanan')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">FloodBar.id</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-sm">Langkah {step} dari 5</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Product Configuration */}
            {step === 1 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Calculator className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Konfigurasi Produk</h2>
                </div>

                {/* Product Model Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Model FloodBar</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setProductForm(prev => ({ ...prev, model: 'Model A' }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        productForm.model === 'Model A'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">Model A</h3>
                      <p className="text-sm text-gray-300 mt-1">Desain standar dengan fitur lengkap</p>
                    </button>
                    <button
                      onClick={() => setProductForm(prev => ({ ...prev, model: 'Model B' }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        productForm.model === 'Model B'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">Model B</h3>
                      <p className="text-sm text-gray-300 mt-1">Desain premium dengan fitur advanced</p>
                    </button>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lebar (cm)</label>
                    <input
                      type="number"
                      value={productForm.width}
                      onChange={(e) => setProductForm(prev => ({ ...prev, width: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tinggi (cm)</label>
                    <input
                      type="number"
                      value={productForm.height}
                      onChange={(e) => setProductForm(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="80"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Jumlah Unit</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? 'Menghitung...' : 'Hitung Harga'}
                </button>

                {calculation && (
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-3">Hasil Kalkulasi</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Harga per cm²:</span>
                        <span>Rp {calculation.pricing.pricePerCm.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Harga:</span>
                        <span className="font-semibold">Rp {calculation.pricing.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Berat:</span>
                        <span>{shippingForm.weight} kg (dibulatkan ke atas)</span>
                      </div>
                    </div>
                    <button
                      onClick={handleNextStep}
                      className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      Lanjut ke Pengiriman
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Truck className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Pilih Pengiriman</h2>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Kota Tujuan</label>
                  <select
                    value={shippingForm.destination}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kota Tujuan</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                  </select>
                </div>

                <button
                  onClick={handleCalculateShipping}
                  disabled={isCalculating || !shippingForm.destination}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {isCalculating ? 'Menghitung Ongkir...' : 'Hitung Ongkir'}
                </button>

                {shippingOptions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Pilihan Kurir</h3>
                    {shippingOptions.map((option: any, index) => (
                      <button
                        key={index}
                        onClick={() => handleShippingSelect(option)}
                        className="w-full p-4 bg-gray-700 rounded-lg text-left hover:bg-gray-600 border border-gray-600"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{option.service}</div>
                            <div className="text-sm text-gray-300">{option.estimatedDays}</div>
                          </div>
                          <div className="font-semibold">Rp {option.cost.toLocaleString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {shippingData && (
                  <div className="mt-6">
                    <div className="flex space-x-4">
                      <button
                        onClick={handlePrevStep}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                      >
                        Kembali
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                      >
                        Lanjut ke Data Pelanggan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Data */}
            {step === 3 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Data Pelanggan</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">No. Telepon *</label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
                    <textarea
                      value={customerData.address}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Kota</label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kode Pos</label>
                      <input
                        type="text"
                        value={customerData.postalCode}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Lanjut ke Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Metode Pembayaran</h2>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedPaymentMethod('xendit')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedPaymentMethod === 'xendit'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <h3 className="font-semibold">Payment Gateway (Xendit)</h3>
                    <p className="text-sm text-gray-300">Kartu Kredit, Transfer Bank, E-Wallet</p>
                  </button>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Review Pesanan
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Order Confirmation */}
            {step === 5 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Send className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Konfirmasi Pesanan</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Data Pelanggan</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>{customerData.name}</p>
                      <p>{customerData.email}</p>
                      <p>{customerData.phone}</p>
                      <p>{customerData.address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Produk</h3>
                    {orderItems.map((item) => (
                      <div key={item.id} className="text-sm text-gray-300">
                        <p>{item.name} - {item.width}cm x {item.height}cm</p>
                        <p>Jumlah: {item.quantity} unit</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Pengiriman</h3>
                    <div className="text-sm text-gray-300">
                      <p>{shippingForm.service}</p>
                      <p>{shippingForm.destination}</p>
                      <p>Berat: {Math.max(Math.ceil(shippingForm.weight), 10)} kg</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ringkasan Pesanan
              </h3>

              {orderItems.length > 0 ? (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border-b border-gray-700 pb-3">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-300">
                        {item.width}cm × {item.height}cm × {item.quantity} unit
                      </p>
                      <p className="font-semibold">Rp {item.totalPrice.toLocaleString()}</p>
                    </div>
                  ))}

                  <div className="space-y-2 pt-3 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {orderSummary.subtotal.toLocaleString()}</span>
                    </div>
                    {shippingData && (
                      <div className="flex justify-between">
                        <span>Ongkir:</span>
                        <span>Rp {shippingData.cost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
                      <span>Total:</span>
                      <span>Rp {orderSummary.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {shippingData && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Info Pengiriman</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <p>Layanan: {shippingForm.service}</p>
                        <p>Estimasi: {shippingData.estimatedDays}</p>
                        <p>Berat: {shippingData.weight} kg (dibulatkan ke atas)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Belum ada produk dalam pesanan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}