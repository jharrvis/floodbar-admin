'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'

interface LandingPageData {
  hero: {
    title: string
    subtitle: string
    backgroundImage: string
  }
  features: Array<{
    title: string
    description: string
    icon: string
  }>
  products: Array<{
    name: string
    price: string
    description: string
    image: string
    features: string[]
  }>
  contact: {
    phone: string
    email: string
    address: string
  }
}

export default function LandingPageEditor() {
  const [data, setData] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/landing')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data) return

    setSaving(true)
    try {
      const response = await fetch('/api/landing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        alert('Data berhasil disimpan!')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const addFeature = () => {
    if (!data) return
    setData({
      ...data,
      features: [
        ...data.features,
        { title: '', description: '', icon: 'star' }
      ]
    })
  }

  const removeFeature = (index: number) => {
    if (!data) return
    setData({
      ...data,
      features: data.features.filter((_, i) => i !== index)
    })
  }

  const addProduct = () => {
    if (!data) return
    setData({
      ...data,
      products: [
        ...data.products,
        {
          name: '',
          price: '',
          description: '',
          image: '',
          features: ['']
        }
      ]
    })
  }

  const removeProduct = (index: number) => {
    if (!data) return
    setData({
      ...data,
      products: data.products.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!data) {
    return <div>Error loading data</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Landing Page</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={data.hero.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    hero: { ...data.hero, title: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={data.hero.subtitle}
                onChange={(e) =>
                  setData({
                    ...data,
                    hero: { ...data.hero, subtitle: e.target.value }
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image URL
              </label>
              <input
                type="text"
                value={data.hero.backgroundImage}
                onChange={(e) =>
                  setData({
                    ...data,
                    hero: { ...data.hero, backgroundImage: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Features</h2>
            <button
              onClick={addFeature}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              Add Feature
            </button>
          </div>
          <div className="space-y-4">
            {data.features.map((feature, index) => (
              <div key={index} className="border p-4 rounded relative">
                <button
                  onClick={() => removeFeature(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...data.features]
                        newFeatures[index].title = e.target.value
                        setData({ ...data, features: newFeatures })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={feature.icon}
                      onChange={(e) => {
                        const newFeatures = [...data.features]
                        newFeatures[index].icon = e.target.value
                        setData({ ...data, features: newFeatures })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...data.features]
                        newFeatures[index].description = e.target.value
                        setData({ ...data, features: newFeatures })
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={data.contact.phone}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, phone: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={data.contact.email}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={data.contact.address}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, address: e.target.value }
                  })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}