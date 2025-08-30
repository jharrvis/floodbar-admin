'use client'

import { useState, useEffect } from 'react'
import { Save, CreditCard, Settings, Eye, EyeOff } from 'lucide-react'

interface PaymentSettings {
  id: string | null
  xenditApiKey: string
  xenditWebhookToken: string
  xenditPublicKey: string
  isXenditEnabled: boolean
  supportedMethods: string[]
  minimumAmount: number
  maximumAmount: number
  adminFee: number
  adminFeeType: 'fixed' | 'percentage'
  successRedirectUrl: string
  failureRedirectUrl: string
  environment: 'sandbox' | 'production'
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    id: null,
    xenditApiKey: '',
    xenditWebhookToken: '',
    xenditPublicKey: '',
    isXenditEnabled: false,
    supportedMethods: ['credit_card', 'bank_transfer', 'ewallet', 'qris'],
    minimumAmount: 10000,
    maximumAmount: 50000000,
    adminFee: 5000,
    adminFeeType: 'fixed',
    successRedirectUrl: '/payment/success',
    failureRedirectUrl: '/payment/failure',
    environment: 'sandbox'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWebhookToken, setShowWebhookToken] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings')
      const data = await response.json()
      
      if (response.ok) {
        setSettings({
          ...settings,
          ...data
        })
      }
    } catch (error) {
      console.error('Error loading payment settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert('Pengaturan pembayaran berhasil disimpan!')
      } else {
        alert(result.error || 'Gagal menyimpan pengaturan pembayaran')
      }
    } catch (error) {
      console.error('Error saving payment settings:', error)
      alert('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setSettings({
        ...settings,
        supportedMethods: [...settings.supportedMethods, method]
      })
    } else {
      setSettings({
        ...settings,
        supportedMethods: settings.supportedMethods.filter(m => m !== method)
      })
    }
  }

  const paymentMethods = [
    { id: 'credit_card', label: 'Kartu Kredit/Debit', description: 'Visa, Mastercard, dll' },
    { id: 'bank_transfer', label: 'Transfer Bank', description: 'Virtual Account BCA, Mandiri, dll' },
    { id: 'ewallet', label: 'E-Wallet', description: 'OVO, GoPay, Dana, dll' },
    { id: 'qris', label: 'QRIS', description: 'Scan QR Code untuk pembayaran' },
    { id: 'retail', label: 'Retail Outlet', description: 'Indomaret, Alfamart' }
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Memuat pengaturan pembayaran...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pembayaran</h1>
          <p className="text-gray-600 mt-1">Konfigurasi payment gateway dan metode pembayaran</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Xendit Configuration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold">Konfigurasi Xendit</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="xendit-enabled"
                checked={settings.isXenditEnabled}
                onChange={(e) => setSettings({ ...settings, isXenditEnabled: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="xendit-enabled" className="text-sm font-medium text-gray-700">
                Aktifkan Xendit Payment Gateway
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={settings.environment}
                  onChange={(e) => setSettings({ ...settings, environment: e.target.value as 'sandbox' | 'production' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xendit Secret API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.xenditApiKey}
                  onChange={(e) => setSettings({ ...settings, xenditApiKey: e.target.value })}
                  placeholder="xnd_development_... atau xnd_production_..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xendit Webhook Verification Token
              </label>
              <div className="relative">
                <input
                  type={showWebhookToken ? "text" : "password"}
                  value={settings.xenditWebhookToken}
                  onChange={(e) => setSettings({ ...settings, xenditWebhookToken: e.target.value })}
                  placeholder="Token untuk verifikasi webhook"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookToken(!showWebhookToken)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showWebhookToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xendit Public Key
              </label>
              <input
                type="text"
                value={settings.xenditPublicKey}
                onChange={(e) => setSettings({ ...settings, xenditPublicKey: e.target.value })}
                placeholder="xnd_public_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Metode Pembayaran</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={method.id}
                  checked={settings.supportedMethods.includes(method.id)}
                  onChange={(e) => handleMethodChange(method.id, e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <label htmlFor={method.id} className="text-sm font-medium text-gray-700">
                    {method.label}
                  </label>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Limits & Fees */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Limit & Biaya</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Pembayaran (Rp)
              </label>
              <input
                type="number"
                value={settings.minimumAmount}
                onChange={(e) => setSettings({ ...settings, minimumAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Pembayaran (Rp)
              </label>
              <input
                type="number"
                value={settings.maximumAmount}
                onChange={(e) => setSettings({ ...settings, maximumAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biaya Admin
              </label>
              <input
                type="number"
                value={settings.adminFee}
                onChange={(e) => setSettings({ ...settings, adminFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Biaya Admin
              </label>
              <select
                value={settings.adminFeeType}
                onChange={(e) => setSettings({ ...settings, adminFeeType: e.target.value as 'fixed' | 'percentage' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="fixed">Fixed (Rupiah)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Redirect URLs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">URL Redirect</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success URL (Setelah pembayaran berhasil)
              </label>
              <input
                type="text"
                value={settings.successRedirectUrl}
                onChange={(e) => setSettings({ ...settings, successRedirectUrl: e.target.value })}
                placeholder="/payment/success"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Failure URL (Setelah pembayaran gagal)
              </label>
              <input
                type="text"
                value={settings.failureRedirectUrl}
                onChange={(e) => setSettings({ ...settings, failureRedirectUrl: e.target.value })}
                placeholder="/payment/failure"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}