'use client'

import { useState, useEffect } from 'react'
import { Save, Calculator } from 'lucide-react'

interface ProductConfig {
  id: string | null
  priceUnder60cm: number
  priceOver60cm: number
  packingThickness: number
  weightConstant: number
  minShippingWeight: number
  pickupCost: number
  insuranceCost: number
  warehouseName: string
  warehouseAddress: string
  warehouseCity: string
  warehouseProvince: string
  warehousePostalCode: string
  warehousePhone: string
}

interface CalculationResult {
  dimensions: {
    width: number
    height: number
    packingThickness: number
  }
  pricing: {
    pricePerCm: number
    basePrice: number
    additionalCosts: number
    totalPrice: number
  }
  shipping: {
    calculatedWeight: number
    minWeight: number
    finalWeight: number
  }
  costs: Array<{
    type: string
    amount: number
    description: string
  }>
}

export default function ProductConfigPage() {
  const [config, setConfig] = useState<ProductConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Calculator states
  const [calcWidth, setCalcWidth] = useState('')
  const [calcHeight, setCalcHeight] = useState('')
  const [includePickup, setIncludePickup] = useState(false)
  const [includeInsurance, setIncludeInsurance] = useState(false)
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/product-config')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      const response = await fetch('/api/product-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()
      if (result.success) {
        alert('Konfigurasi berhasil disimpan!')
      } else {
        alert(result.error || 'Gagal menyimpan konfigurasi')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleCalculate = async () => {
    if (!calcWidth || !calcHeight) {
      alert('Lebar dan tinggi wajib diisi')
      return
    }

    setCalculating(true)
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width: parseFloat(calcWidth),
          height: parseFloat(calcHeight),
          includePickup,
          includeInsurance
        }),
      })

      const result = await response.json()
      if (result.success) {
        setCalculation(result.data)
      } else {
        alert(result.error || 'Gagal menghitung harga')
      }
    } catch (error) {
      console.error('Error calculating:', error)
      alert('Terjadi kesalahan')
    } finally {
      setCalculating(false)
    }
  }

  const updateConfig = (key: keyof ProductConfig, value: any) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!config) {
    return <div>Error loading configuration</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Produk & Pengiriman</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Pricing Configuration */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pengaturan Harga</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga per cm untuk lebar &lt; 60 cm (Rp)
                </label>
                <input
                  type="number"
                  value={config.priceUnder60cm}
                  onChange={(e) => updateConfig('priceUnder60cm', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga per cm untuk lebar ≥ 60 cm (Rp)
                </label>
                <input
                  type="number"
                  value={config.priceOver60cm}
                  onChange={(e) => updateConfig('priceOver60cm', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Shipping Configuration */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pengaturan Pengiriman</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tebal Packing (L) dalam cm
                </label>
                <input
                  type="number"
                  value={config.packingThickness}
                  onChange={(e) => updateConfig('packingThickness', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konstanta Berat
                </label>
                <input
                  type="number"
                  value={config.weightConstant}
                  onChange={(e) => updateConfig('weightConstant', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.000001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Berat = Lebar × Tinggi × Tebal Packing × Konstanta
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimal Berat Kirim (kg)
                </label>
                <input
                  type="number"
                  value={config.minShippingWeight}
                  onChange={(e) => updateConfig('minShippingWeight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Biaya Tambahan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biaya Pickup (Rp)
                </label>
                <input
                  type="number"
                  value={config.pickupCost}
                  onChange={(e) => updateConfig('pickupCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biaya Asuransi (Rp)
                </label>
                <input
                  type="number"
                  value={config.insuranceCost}
                  onChange={(e) => updateConfig('insuranceCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Warehouse Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Alamat Gudang</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Gudang
                </label>
                <input
                  type="text"
                  value={config.warehouseName}
                  onChange={(e) => updateConfig('warehouseName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={config.warehouseAddress}
                  onChange={(e) => updateConfig('warehouseAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={config.warehouseCity}
                    onChange={(e) => updateConfig('warehouseCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={config.warehouseProvince}
                    onChange={(e) => updateConfig('warehouseProvince', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={config.warehousePostalCode}
                    onChange={(e) => updateConfig('warehousePostalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={config.warehousePhone}
                    onChange={(e) => updateConfig('warehousePhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Kalkulator Harga</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lebar (cm)
                  </label>
                  <input
                    type="number"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="pickup"
                    type="checkbox"
                    checked={includePickup}
                    onChange={(e) => setIncludePickup(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pickup" className="ml-2 block text-sm text-gray-700">
                    Termasuk biaya pickup (Rp {config.pickupCost.toLocaleString('id-ID')})
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="insurance"
                    type="checkbox"
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="insurance" className="ml-2 block text-sm text-gray-700">
                    Termasuk biaya asuransi (Rp {config.insuranceCost.toLocaleString('id-ID')})
                  </label>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calculator size={16} />
                {calculating ? 'Menghitung...' : 'Hitung Harga'}
              </button>

              {calculation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Hasil Perhitungan:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dimensi:</span>
                      <span>{calculation.dimensions.width} × {calculation.dimensions.height} × {calculation.dimensions.packingThickness} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga per cm:</span>
                      <span>Rp {calculation.pricing.pricePerCm.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga dasar:</span>
                      <span>Rp {calculation.pricing.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {calculation.costs.map((cost, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{cost.description}:</span>
                        <span>Rp {cost.amount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Harga:</span>
                      <span>Rp {calculation.pricing.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Berat pengiriman:</span>
                      <span>{calculation.shipping.finalWeight} kg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}