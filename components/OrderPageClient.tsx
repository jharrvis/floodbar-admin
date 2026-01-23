'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calculator, ShoppingCart, User, MapPin, CreditCard, Send, Package, Truck, Shield, MessageCircle } from 'lucide-react'

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

export default function OrderPageClient() {
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('xendit')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shippingCost: 0,
    grandTotal: 0
  })

  // Product configuration form
  const [productForm, setProductForm] = useState({
    width: '',
    height: '',
    quantity: 1
  })

  // Auto-calculate when dimensions change
  useEffect(() => {
    if (productForm.width && productForm.height && productForm.quantity) {
      calculateProductPrice()
    }
  }, [productForm.width, productForm.height, productForm.quantity])

  // Fetch settings for logo
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

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
  const [settings, setSettings] = useState<any>(null)

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
          name: `FloodBar Premium ${productForm.width}cm x ${productForm.height}cm`,
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

  const calculateShipping = async (selectedCity?: any, overrideInsurance?: boolean, overridePickup?: boolean) => {
    const city = selectedCity || shippingForm.selectedCity
    if (!city || !shippingForm.weight) return

    setShippingCalculating(true)
    try {
      // Use the actual calculated weight from the product calculation
      // Round up the weight (e.g., 14.4kg becomes 15kg) then apply minimum 10kg
      const roundedWeight = Math.ceil(shippingForm.weight)
      const shippingWeight = Math.max(roundedWeight, 10) // Minimum 10kg for shipping cost

      // Calculate shipping cost based on selected city price
      const shippingCost = shippingWeight * parseFloat(city.price_per_kg || '15000')

      // Use override values if provided, otherwise use current state
      const currentInsuranceSelected = overrideInsurance !== undefined ? overrideInsurance : insuranceSelected
      const currentPickupSelected = overridePickup !== undefined ? overridePickup : pickupSelected

      // Insurance (optional - 1% of product value)
      const insuranceCost = currentInsuranceSelected ? Math.max(orderSummary.subtotal * 0.01, 5000) : 0

      // Pickup fee (optional - fixed rate)
      const pickupCost = currentPickupSelected ? 25000 : 0

      const totalShippingCost = shippingCost + insuranceCost + pickupCost

      setShippingData({
        cost: totalShippingCost,
        estimatedDays: '3-5 hari kerja',
        weight: roundedWeight, // Show rounded weight for billing
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
    const grandTotal = subtotal + shippingCost

    setOrderSummary({
      subtotal,
      shippingCost,
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
          model: 'FloodBar Premium',
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
        } else if (selectedPaymentMethod === 'xendit' && !result.paymentUrl) {
          // Order created but payment URL failed (likely Xendit IP allowlist issue)
          alert('Order berhasil dibuat tetapi link pembayaran tidak dapat dibuat. Silakan hubungi customer service untuk melanjutkan pembayaran.')
          setStep(5) // Go to confirmation
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
            {/* Shipping Cost Breakdown */}
            {shippingData && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Ongkir (PKS):</span>
                  <span>Rp {Math.round((shippingData.cost || 0) - (shippingData.insuranceCost || 0) - (shippingData.pickupCost || 0)).toLocaleString()}</span>
                </div>
                {shippingData.insuranceCost && shippingData.insuranceCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Asuransi:</span>
                    <span>Rp {shippingData.insuranceCost.toLocaleString()}</span>
                  </div>
                )}
                {shippingData.pickupCost && shippingData.pickupCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Biaya Pickup:</span>
                    <span>Rp {shippingData.pickupCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total Ongkir:</span>
                  <span>Rp {shippingData.cost.toLocaleString()}</span>
                </div>
              </>
            )}
            {!shippingData && orderSummary.shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span>Rp {orderSummary.shippingCost.toLocaleString()}</span>
              </div>
            )}
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
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white px-4 py-3 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="https://floodbar.id" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.siteName || 'FloodBar.id'}
                className="w-8 h-8 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo-floodbar.webp'
                }}
              />
            ) : (
              <img
                src="/images/logo-floodbar.webp"
                alt={settings?.siteName || 'FloodBar.id'}
                className="w-8 h-8 object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = '<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>'
                  }
                }}
              />
            )}
            <span className="font-bold text-xl">{settings?.siteName || 'FloodBar.id'}</span>
          </a>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-sm">Pre-Order: ★★★★★</span>
            <span className="text-sm">Custom Fit: ★★★★★</span>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Pre-Order FloodBar Custom</h1>
            <p className="text-lg text-gray-300">Sekat pintu anti banjir yang dibuat khusus sesuai ukuran pintu Anda</p>

            {/* Progress Steps */}
            <div className="flex items-center space-x-2 md:space-x-4 mb-8 overflow-x-auto pb-2">
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
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= stepItem.num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`ml-2 text-xs md:text-sm font-medium whitespace-nowrap ${step >= stepItem.num ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {stepItem.title}
                    </span>
                    {stepItem.num < 5 && (
                      <div className={`w-16 h-0.5 ml-4 ${step > stepItem.num ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Step 1: Product Configuration */}
              {step === 1 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Package size={24} />
                    Konfigurasi Produk
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                        Pesan Sekarang
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
                      <p className="font-medium">Ongkos Kirim: Rp {Math.round(shippingData.cost - (shippingData.insuranceCost || 0) - (shippingData.pickupCost || 0)).toLocaleString()}</p>
                      {shippingData.insuranceCost && shippingData.insuranceCost > 0 && (
                        <p className="text-sm text-gray-600">Asuransi: Rp {shippingData.insuranceCost.toLocaleString()}</p>
                      )}
                      {shippingData.pickupCost && shippingData.pickupCost > 0 && (
                        <p className="text-sm text-gray-600">Pickup: Rp {shippingData.pickupCost.toLocaleString()}</p>
                      )}
                      <p className="text-sm text-gray-600">Total: Rp {shippingData.cost.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Estimasi: {shippingData.estimatedDays}</p>
                      <p className="text-sm text-gray-600">Berat: {shippingData.weight} kg</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                      { id: 'xendit', name: 'Pembayaran Online', desc: 'Kartu Kredit, Virtual Account, E-Wallet, QRIS via Xendit' }
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
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80">
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 sticky top-4">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                  <ShoppingCart size={24} className="text-blue-400" />
                  Ringkasan Pre-Order
                </h3>

                {orderItems.length > 0 && (
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="border-b border-gray-700 pb-4">
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-300">
                          Quantity: {item.quantity} unit
                        </p>
                        <p className="text-lg font-bold text-blue-400">
                          Rp {item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    ))}

                    <div className="space-y-3 pt-4 border-t border-gray-700">
                      <div className="flex justify-between text-white">
                        <span>Subtotal:</span>
                        <span className="font-semibold">Rp {orderSummary.subtotal.toLocaleString()}</span>
                      </div>
                      {shippingData && (
                        <>
                          <div className="flex justify-between text-sm text-gray-300">
                            <span>Ongkir:</span>
                            <span>Rp {shippingData.cost.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between font-bold text-xl border-t border-gray-700 pt-3 text-blue-400">
                        <span>Grand Total:</span>
                        <span>Rp {orderSummary.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${settings?.contact?.phone?.replace(/[^0-9]/g, '') || '6281234567890'}?text=Halo,%20saya%20butuh%20bantuan%20dengan%20order%20FloodBar%20custom`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:shadow-xl z-50"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}