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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('xendit')
  const [processingPayment, setProcessingPayment] = useState(false)
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
    quantity: 1
  })
  const [calculating, setCalculating] = useState(false)

  // Shipping form
  const [shippingForm, setShippingForm] = useState({
    destinationCity: '',
    selectedCity: null as any,
    weight: 0
  })
  const [citySearchResults, setCitySearchResults] = useState([])
  const [searchingCities, setSearchingCities] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [insuranceSelected, setInsuranceSelected] = useState(false)
  const [pickupSelected, setPickupSelected] = useState(false)
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
  const searchCities = async (query: string) => {
    if (query.length < 3) {
      setCitySearchResults([])
      setShowCityDropdown(false)
      return
    }

    setSearchingCities(true)
    try {
      const response = await fetch(`/api/shipping-search?q=${encodeURIComponent(query)}`)
      const result = await response.json()
      
      if (result.success) {
        setCitySearchResults(result.cities)
        setShowCityDropdown(true)
      }
    } catch (error) {
      console.error('Error searching cities:', error)
    } finally {
      setSearchingCities(false)
    }
  }

  const handleCityInputChange = (value: string) => {
    setShippingForm({ ...shippingForm, destinationCity: value, selectedCity: null })
    searchCities(value)
  }

  const selectCity = (city: any) => {
    setShippingForm({ 
      ...shippingForm, 
      destinationCity: city.city, 
      selectedCity: city 
    })
    setShowCityDropdown(false)
    setCitySearchResults([])
    calculateShipping(city)
  }

  const calculateShipping = async (selectedCity?: any) => {
    const city = selectedCity || shippingForm.selectedCity
    if (!city || !shippingForm.weight) return

    setShippingCalculating(true)
    try {
      // Calculate minimum weight (10kg minimum)
      const actualWeight = Math.max(shippingForm.weight, 10)
      
      // Calculate shipping cost based on selected city price
      const shippingCost = actualWeight * parseFloat(city.price_per_kg || '15000')
      
      // Insurance (optional - 1% of product value)
      const insuranceCost = insuranceSelected ? Math.max(orderSummary.subtotal * 0.01, 5000) : 0
      
      // Pickup fee (optional - fixed rate)
      const pickupCost = pickupSelected ? 25000 : 0
      
      const totalShippingCost = shippingCost + insuranceCost + pickupCost

      setShippingData({
        cost: totalShippingCost,
        estimatedDays: '3-5 hari kerja',
        weight: actualWeight,
        insuranceCost,
        pickupCost
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
          thickness: 5,
          quantity: firstItem?.quantity || 1,
          finish: 'Standard'
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
        if (result.paymentUrl && selectedPaymentMethod === 'xendit') {
          // Redirect to Xendit payment page
          window.location.href = result.paymentUrl
        } else {
          setStep(5) // Go to confirmation for other payment methods
        }
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota Tujuan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={shippingForm.destinationCity}
                      onChange={(e) => handleCityInputChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ketik minimal 3 karakter untuk mencari kota..."
                    />
                    {searchingCities && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {showCityDropdown && citySearchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {citySearchResults.map((city: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => selectCity(city)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{city.city}</div>
                            <div className="text-sm text-gray-500">
                              Rp {parseInt(city.price_per_kg).toLocaleString()}/kg
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Insurance and Pickup Options */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="insurance"
                      checked={insuranceSelected}
                      onChange={(e) => {
                        setInsuranceSelected(e.target.checked)
                        if (shippingForm.selectedCity) {
                          calculateShipping()
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="insurance" className="text-sm text-gray-700">
                      Asuransi Pengiriman (1% dari nilai barang, min Rp 5.000)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pickup"
                      checked={pickupSelected}
                      onChange={(e) => {
                        setPickupSelected(e.target.checked)
                        if (shippingForm.selectedCity) {
                          calculateShipping()
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="pickup" className="text-sm text-gray-700">
                      Layanan Pickup (Rp 25.000)
                    </label>
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
                  {shippingData && (
                    <button
                      onClick={() => setStep(3)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Lanjut ke Data Diri
                    </button>
                  )}
                  {!shippingForm.selectedCity && (
                    <div className="text-sm text-gray-500 flex items-center">
                      Silakan pilih kota tujuan dari hasil pencarian
                    </div>
                  )}
                </div>
                {shippingData && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <p className="font-medium">Ongkos Kirim: Rp {(shippingData.cost - (shippingData.insuranceCost || 0) - (shippingData.pickupCost || 0)).toLocaleString()}</p>
                    {shippingData.insuranceCost && shippingData.insuranceCost > 0 && (
                      <p className="text-sm text-gray-600">Asuransi: Rp {shippingData.insuranceCost.toLocaleString()}</p>
                    )}
                    {shippingData.pickupCost && shippingData.pickupCost > 0 && (
                      <p className="text-sm text-gray-600">Pickup: Rp {shippingData.pickupCost.toLocaleString()}</p>
                    )}
                    <p className="text-sm text-gray-600">Total: Rp {shippingData.cost.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Estimasi: {shippingData.estimatedDays}</p>
                    <p className="text-sm text-gray-600">Berat: {shippingData.weight} kg (minimum 10kg)</p>
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
                    { id: 'xendit', name: 'Pembayaran Online', desc: 'Kartu Kredit, Virtual Account, E-Wallet, QRIS via Xendit' },
                    { id: 'bank_transfer', name: 'Transfer Bank Manual', desc: 'Transfer ke rekening bank (konfirmasi manual)' },
                    { id: 'cod', name: 'Bayar di Tempat (COD)', desc: 'Pembayaran saat barang diterima' }
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
                    {submitting ? 'Memproses...' : (selectedPaymentMethod === 'xendit' ? 'Lanjut ke Pembayaran' : 'Buat Pesanan')}
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