'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Eye } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'

interface LandingPageData {
  hero: {
    title: string
    subtitle: string
    backgroundImage: string
    heroImage: string
  }
  service: {
    title: string
    description: string
    process: string
    image: string
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
  faq: {
    title: string
    questions: Array<{
      question: string
      answer: string
    }>
    image: string
  }
  floodInfo: {
    title: string
    description: string
    description2: string
    images: string[]
    stats: Array<{
      value: string
      label: string
    }>
  }
  testimonials: Array<{
    name: string
    location: string
    text: string
    image: string
    rating: number
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
  const [activeSection, setActiveSection] = useState('hero')

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

  // Feature functions
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

  // Product functions
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

  const addProductFeature = (productIndex: number) => {
    if (!data) return
    const newProducts = [...data.products]
    newProducts[productIndex].features.push('')
    setData({ ...data, products: newProducts })
  }

  const removeProductFeature = (productIndex: number, featureIndex: number) => {
    if (!data) return
    const newProducts = [...data.products]
    newProducts[productIndex].features = newProducts[productIndex].features.filter((_, i) => i !== featureIndex)
    setData({ ...data, products: newProducts })
  }

  // FAQ functions
  const addFAQ = () => {
    if (!data) return
    setData({
      ...data,
      faq: {
        ...data.faq,
        questions: [
          ...data.faq.questions,
          { question: '', answer: '' }
        ]
      }
    })
  }

  const removeFAQ = (index: number) => {
    if (!data) return
    setData({
      ...data,
      faq: {
        ...data.faq,
        questions: data.faq.questions.filter((_, i) => i !== index)
      }
    })
  }

  // FloodInfo functions
  const addFloodImage = () => {
    if (!data) return
    setData({
      ...data,
      floodInfo: {
        ...data.floodInfo,
        images: [...data.floodInfo.images, '']
      }
    })
  }

  const removeFloodImage = (index: number) => {
    if (!data) return
    setData({
      ...data,
      floodInfo: {
        ...data.floodInfo,
        images: data.floodInfo.images.filter((_, i) => i !== index)
      }
    })
  }

  const addStat = () => {
    if (!data) return
    setData({
      ...data,
      floodInfo: {
        ...data.floodInfo,
        stats: [...data.floodInfo.stats, { value: '', label: '' }]
      }
    })
  }

  const removeStat = (index: number) => {
    if (!data) return
    setData({
      ...data,
      floodInfo: {
        ...data.floodInfo,
        stats: data.floodInfo.stats.filter((_, i) => i !== index)
      }
    })
  }

  // Testimonial functions
  const addTestimonial = () => {
    if (!data) return
    setData({
      ...data,
      testimonials: [
        ...data.testimonials,
        {
          name: '',
          location: '',
          text: '',
          image: '',
          rating: 5
        }
      ]
    })
  }

  const removeTestimonial = (index: number) => {
    if (!data) return
    setData({
      ...data,
      testimonials: data.testimonials.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!data) {
    return <div>Error loading data</div>
  }

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'service', label: 'Service' },
    { id: 'features', label: 'Features' },
    { id: 'products', label: 'Products' },
    { id: 'faq', label: 'FAQ' },
    { id: 'floodInfo', label: 'Flood Info' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Landing Page</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Navigation */}
        <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
          <h3 className="font-semibold mb-4">Sections</h3>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Hero Section */}
          {activeSection === 'hero' && (
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
                    Background Image
                  </label>
                  <ImageUpload
                    value={data.hero.backgroundImage}
                    onChange={(value) => {
                      console.log('=== LANDING PAGE onChange ===')
                      console.log('New backgroundImage value:', value)
                      console.log('Previous data:', data.hero.backgroundImage)
                      setData(prevData => {
                        const newData = {
                          ...prevData,
                          hero: { ...prevData.hero, backgroundImage: value }
                        }
                        console.log('Updated data:', newData.hero.backgroundImage)
                        return newData
                      })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Image
                  </label>
                  <ImageUpload
                    value={data.hero.heroImage}
                    onChange={(value) => {
                      console.log('=== LANDING PAGE onChange HERO ===')
                      console.log('New heroImage value:', value)
                      console.log('Previous data:', data.hero.heroImage)
                      setData(prevData => {
                        const newData = {
                          ...prevData,
                          hero: { ...prevData.hero, heroImage: value }
                        }
                        console.log('Updated data:', newData.hero.heroImage)
                        return newData
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Service Section */}
          {activeSection === 'service' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Service Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={data.service.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        service: { ...data.service, title: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={data.service.description}
                    onChange={(e) =>
                      setData({
                        ...data,
                        service: { ...data.service, description: e.target.value }
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Process
                  </label>
                  <textarea
                    value={data.service.process}
                    onChange={(e) =>
                      setData({
                        ...data,
                        service: { ...data.service, process: e.target.value }
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image
                  </label>
                  <ImageUpload
                    value={data.service.image}
                    onChange={(value) =>
                      setData({
                        ...data,
                        service: { ...data.service, image: value }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          {activeSection === 'features' && (
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
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Products</h2>
                <button
                  onClick={addProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>
              <div className="space-y-6">
                {data.products.map((product, index) => (
                  <div key={index} className="border p-4 rounded relative">
                    <button
                      onClick={() => removeProduct(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => {
                            const newProducts = [...data.products]
                            newProducts[index].name = e.target.value
                            setData({ ...data, products: newProducts })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => {
                            const newProducts = [...data.products]
                            newProducts[index].price = e.target.value
                            setData({ ...data, products: newProducts })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => {
                          const newProducts = [...data.products]
                          newProducts[index].description = e.target.value
                          setData({ ...data, products: newProducts })
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <ImageUpload
                        value={product.image}
                        onChange={(value) => {
                          const newProducts = [...data.products]
                          newProducts[index].image = value
                          setData({ ...data, products: newProducts })
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Features
                        </label>
                        <button
                          onClick={() => addProductFeature(index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Add Feature
                        </button>
                      </div>
                      <div className="space-y-2">
                        {product.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newProducts = [...data.products]
                                newProducts[index].features[featureIndex] = e.target.value
                                setData({ ...data, products: newProducts })
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={() => removeProductFeature(index, featureIndex)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">FAQ Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAQ Title
                  </label>
                  <input
                    type="text"
                    value={data.faq.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        faq: { ...data.faq, title: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAQ Image
                  </label>
                  <ImageUpload
                    value={data.faq.image}
                    onChange={(value) =>
                      setData({
                        ...data,
                        faq: { ...data.faq, image: value }
                      })
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium">Questions</h3>
                    <button
                      onClick={addFAQ}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.faq.questions.map((faq, index) => (
                      <div key={index} className="border p-4 rounded relative">
                        <button
                          onClick={() => removeFAQ(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question
                            </label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const newQuestions = [...data.faq.questions]
                                newQuestions[index].question = e.target.value
                                setData({ ...data, faq: { ...data.faq, questions: newQuestions } })
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Answer
                            </label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => {
                                const newQuestions = [...data.faq.questions]
                                newQuestions[index].answer = e.target.value
                                setData({ ...data, faq: { ...data.faq, questions: newQuestions } })
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flood Info Section */}
          {activeSection === 'floodInfo' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Flood Information Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={data.floodInfo.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        floodInfo: { ...data.floodInfo, title: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description 1
                  </label>
                  <textarea
                    value={data.floodInfo.description}
                    onChange={(e) =>
                      setData({
                        ...data,
                        floodInfo: { ...data.floodInfo, description: e.target.value }
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description 2
                  </label>
                  <textarea
                    value={data.floodInfo.description2}
                    onChange={(e) =>
                      setData({
                        ...data,
                        floodInfo: { ...data.floodInfo, description2: e.target.value }
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Images
                    </label>
                    <button
                      onClick={addFloodImage}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Image
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.floodInfo.images.map((image, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ImageUpload
                            value={image}
                            onChange={(value) => {
                              const newImages = [...data.floodInfo.images]
                              newImages[index] = value
                              setData({ ...data, floodInfo: { ...data.floodInfo, images: newImages } })
                            }}
                          />
                        </div>
                        <button
                          onClick={() => removeFloodImage(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Statistics
                    </label>
                    <button
                      onClick={addStat}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Statistic
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.floodInfo.stats.map((stat, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Value"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...data.floodInfo.stats]
                            newStats[index].value = e.target.value
                            setData({ ...data, floodInfo: { ...data.floodInfo, stats: newStats } })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Label"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...data.floodInfo.stats]
                            newStats[index].label = e.target.value
                            setData({ ...data, floodInfo: { ...data.floodInfo, stats: newStats } })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={() => removeStat(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {activeSection === 'testimonials' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Testimonials</h2>
                <button
                  onClick={addTestimonial}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Testimonial
                </button>
              </div>
              <div className="space-y-6">
                {data.testimonials.map((testimonial, index) => (
                  <div key={index} className="border p-4 rounded relative">
                    <button
                      onClick={() => removeTestimonial(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...data.testimonials]
                            newTestimonials[index].name = e.target.value
                            setData({ ...data, testimonials: newTestimonials })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={testimonial.location}
                          onChange={(e) => {
                            const newTestimonials = [...data.testimonials]
                            newTestimonials[index].location = e.target.value
                            setData({ ...data, testimonials: newTestimonials })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text
                      </label>
                      <textarea
                        value={testimonial.text}
                        onChange={(e) => {
                          const newTestimonials = [...data.testimonials]
                          newTestimonials[index].text = e.target.value
                          setData({ ...data, testimonials: newTestimonials })
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image
                        </label>
                        <ImageUpload
                          value={testimonial.image}
                          onChange={(value) => {
                            const newTestimonials = [...data.testimonials]
                            newTestimonials[index].image = value
                            setData({ ...data, testimonials: newTestimonials })
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <select
                          value={testimonial.rating}
                          onChange={(e) => {
                            const newTestimonials = [...data.testimonials]
                            newTestimonials[index].rating = parseInt(e.target.value)
                            setData({ ...data, testimonials: newTestimonials })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value={1}>1 Star</option>
                          <option value={2}>2 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={5}>5 Stars</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 gap-4">
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
          )}
        </div>
      </div>
    </div>
  )
}