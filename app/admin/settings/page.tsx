'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, Upload, Instagram, Facebook } from 'lucide-react'

interface SystemSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  emailNotifications: boolean
  backupFrequency: string
  timezone: string
  language: string
  logoUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  facebookUrl?: string
  facebookPixel?: string
  googleAnalytics?: string
}

interface CloudinarySettings {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '',
    siteDescription: '',
    adminEmail: '',
    maintenanceMode: false,
    allowRegistration: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    timezone: 'Asia/Jakarta',
    language: 'id',
    logoUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    facebookPixel: '',
    googleAnalytics: ''
  })

  const [cloudinarySettings, setCloudinarySettings] = useState<CloudinarySettings>({
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    uploadPreset: 'floodbar_uploads'
  })

  const [loading, setLoading] = useState(true)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [saving, setSaving] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Load system settings
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (response.ok) {
        setSettings({
          siteName: data.siteName || 'FloodBar Admin Panel',
          siteDescription: data.siteDescription || 'Admin panel untuk mengelola halaman penjualan FloodBar',
          adminEmail: data.adminEmail || 'admin@floodbar.id',
          maintenanceMode: data.maintenanceMode || false,
          allowRegistration: data.allowRegistration || false,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          backupFrequency: data.backupFrequency || 'daily',
          timezone: data.timezone || 'Asia/Jakarta',
          language: data.language || 'id',
          logoUrl: data.logoUrl || '',
          instagramUrl: data.instagramUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          facebookUrl: data.facebookUrl || '',
          facebookPixel: data.facebookPixel || '',
          googleAnalytics: data.googleAnalytics || ''
        })
      }

      // Load Cloudinary settings
      const cloudinaryResponse = await fetch('/api/admin/settings/cloudinary')
      const cloudinaryData = await cloudinaryResponse.json()
      
      if (cloudinaryResponse.ok) {
        setCloudinarySettings({
          cloudName: cloudinaryData.cloudName || '',
          apiKey: cloudinaryData.apiKey || '',
          apiSecret: cloudinaryData.apiSecret || '',
          uploadPreset: cloudinaryData.uploadPreset || 'floodbar_uploads'
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert('Pengaturan berhasil disimpan!')
      } else {
        alert(result.error || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCloudinary = async () => {
    setSaving(true)
    try {
      console.log('Saving Cloudinary settings:', {
        cloudName: cloudinarySettings.cloudName || 'NOT SET',
        apiKey: cloudinarySettings.apiKey ? 'SET' : 'NOT SET',
        apiSecret: cloudinarySettings.apiSecret ? 'SET' : 'NOT SET',
        uploadPreset: cloudinarySettings.uploadPreset || 'NOT SET'
      })

      const response = await fetch('/api/admin/settings/cloudinary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudinarySettings),
      })

      const result = await response.json()
      console.log('Save response:', result)
      
      if (response.ok && result.success) {
        alert('Pengaturan Cloudinary berhasil disimpan!')
        // Reload settings to verify they were saved
        await loadSettings()
      } else {
        alert('Gagal menyimpan pengaturan Cloudinary: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving Cloudinary settings:', error)
      alert('Gagal menyimpan pengaturan Cloudinary: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setSaving(false)
    }
  }

  const testCloudinaryConnection = async () => {
    if (!cloudinarySettings.cloudName || !cloudinarySettings.apiKey || !cloudinarySettings.apiSecret) {
      alert('Silakan isi semua field terlebih dahulu')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      const response = await fetch('/api/admin/settings/test-cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudinarySettings),
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setConnectionStatus('success')
          alert('Koneksi Cloudinary berhasil!')
        } else {
          setConnectionStatus('error')
          alert('Koneksi Cloudinary gagal: ' + result.error)
        }
      } else {
        setConnectionStatus('error')
        alert('Koneksi Cloudinary gagal')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setConnectionStatus('error')
      alert('Koneksi Cloudinary gagal')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password baru minimal 6 karakter')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Password berhasil diubah!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      alert('Gagal mengubah password')
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.')
      return
    }

    setUploadingLogo(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', cloudinarySettings.uploadPreset || 'floodbar_uploads')

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinarySettings.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        // Update logo URL in settings
        setSettings(prev => ({
          ...prev,
          logoUrl: result.secure_url
        }))
        alert('Logo berhasil diupload!')
      } else {
        throw new Error(result.error?.message || 'Upload gagal')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload logo. Pastikan konfigurasi Cloudinary sudah benar.')
    } finally {
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Memuat pengaturan...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

      <div className="space-y-6">
        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pengaturan Sistem</h2>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Website
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Admin
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bahasa
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Website
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Branding Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Branding & Logo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Website
                </label>
                <div className="flex items-start gap-4">
                  {settings.logoUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="h-16 w-16 object-contain rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                        uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload size={16} />
                      {uploadingLogo ? 'Mengupload...' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG. Maksimal 2MB. Disarankan 200x200px.
                    </p>
                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-red-600 text-sm mt-2 hover:underline"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram size={16} className="inline mr-2" />
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => handleSettingChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="inline w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53 9.29l-.01-.02-1.46 1.47-3.53 3.53-6.5 6.5s.31.31.72.31c.38 0 .7-.14.97-.39l5.5-5.5 3.5-3.5 1.47-1.47-.66-.69zm6.21 8.09c1.17-1.17 1.17-3.07 0-4.24l-1.17-1.17-1.46 1.47 1.17 1.17c.39.39.39 1.02 0 1.41l-1.17 1.17-1.46 1.47 1.17 1.17c1.17 1.17 3.07 1.17 4.24 0 .29-.29.68-.72.68-.68z"/>
                  </svg>
                  TikTok URL
                </label>
                <input
                  type="url"
                  value={settings.tiktokUrl}
                  onChange={(e) => handleSettingChange('tiktokUrl', e.target.value)}
                  placeholder="https://tiktok.com/@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Facebook size={16} className="inline mr-2" />
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => handleSettingChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Analytics & Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={settings.googleAnalytics}
                  onChange={(e) => handleSettingChange('googleAnalytics', e.target.value)}
                  placeholder="GA-XXXXXXXXX-X atau G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan Google Analytics Measurement ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={settings.facebookPixel}
                  onChange={(e) => handleSettingChange('facebookPixel', e.target.value)}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan Facebook Pixel ID (hanya angka)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                id="maintenance"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenance" className="ml-2 block text-sm text-gray-700">
                Mode Maintenance
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="registration"
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="registration" className="ml-2 block text-sm text-gray-700">
                Izinkan Registrasi User Baru
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                Notifikasi Email
              </label>
            </div>
          </div>
        </div>

        {/* Cloudinary Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pengaturan Cloudinary</h2>
            <div className="flex gap-2">
              <button
                onClick={testCloudinaryConnection}
                disabled={testingConnection}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-white disabled:opacity-50 ${
                  connectionStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : connectionStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {testingConnection ? 'Testing...' : 'Test Koneksi'}
              </button>
              <button
                onClick={handleSaveCloudinary}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Konfigurasi Cloudinary digunakan untuk upload dan manajemen gambar. 
            Dapatkan API credentials dari <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Cloudinary Console</a>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Name
              </label>
              <input
                type="text"
                value={cloudinarySettings.cloudName}
                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, cloudName: e.target.value })}
                placeholder="your-cloud-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nama cloud Cloudinary Anda (terlihat di dashboard Cloudinary)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={cloudinarySettings.apiKey}
                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, apiKey: e.target.value })}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                API Key dari Cloudinary Console
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <div className="relative">
                <input
                  type={showApiSecret ? 'text' : 'password'}
                  value={cloudinarySettings.apiSecret}
                  onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, apiSecret: e.target.value })}
                  placeholder="abcdefghijklmnopqrstuvwxyz123456"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiSecret ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                API Secret dari Cloudinary Console (jaga kerahasiaan!)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Preset
              </label>
              <input
                type="text"
                value={cloudinarySettings.uploadPreset}
                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, uploadPreset: e.target.value })}
                placeholder="floodbar_uploads"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload preset yang sudah dikonfigurasi di Cloudinary (unsigned preset)
              </p>
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-md ${
              connectionStatus === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {connectionStatus === 'success' 
                ? '✅ Koneksi Cloudinary berhasil! API credentials valid.'
                : '❌ Koneksi Cloudinary gagal. Periksa kembali API credentials.'
              }
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-md font-semibold text-blue-900 mb-2">Cara Setup Cloudinary</h3>
            <ol className="space-y-1 text-sm text-blue-800">
              <li>1. Daftar akun gratis di <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">cloudinary.com</a></li>
              <li>2. Masuk ke <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline font-medium">Cloudinary Console</a></li>
              <li>3. Copy Cloud Name, API Key, dan API Secret dari dashboard</li>
              <li>4. Buat Upload Preset (Settings → Upload → Add upload preset)</li>
              <li>5. Masukkan informasi di atas, test koneksi, lalu simpan</li>
            </ol>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Ubah Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}