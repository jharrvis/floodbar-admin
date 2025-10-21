'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Star, Shield, Wrench, Droplets, CheckCircle, AlertTriangle, Home, ChevronLeft, ChevronRight, ArrowUp, Instagram, Facebook, Play, ChevronDown, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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
  videos: Array<{
    id: string
    title: string
    embedUrl: string
    isActive: boolean
  }>
}

const iconMap: { [key: string]: any } = {
  wrench: Wrench,
  shield: Shield,
  droplets: Droplets,
  star: Star,
  home: Home,
  alert: AlertTriangle,
}

function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 pr-4">
          {question}
        </h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2">
          <p className="text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [data, setData] = useState<LandingPageData | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)


  useEffect(() => {
    fetchData()
    fetchSettings()
    fetchNews()
    
    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Testimonial carousel auto-play
  useEffect(() => {
    if (data?.testimonials?.length) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % data.testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [data?.testimonials])

  const nextTestimonial = () => {
    if (data?.testimonials?.length) {
      setCurrentTestimonial((prev) => (prev + 1) % data.testimonials.length)
    }
  }

  const prevTestimonial = () => {
    if (data?.testimonials?.length) {
      setCurrentTestimonial((prev) => (prev - 1 + data.testimonials.length) % data.testimonials.length)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const result = await response.json()
      setSettings(result)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setNews(result.data.slice(0, 10)) // Limit to 10 latest news
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Error loading page</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-sm">Layanan: ★★★★★</span>
            <span className="text-sm">Kualitas: ★★★★★</span>
            <Link href="/order-status">
              <button className="bg-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 mr-2">
                Cek Status Pesanan
              </button>
            </Link>
            {/* <button className="bg-green-600 px-4 py-2 rounded text-sm font-semibold hover:bg-green-700">
              Hubungi Kami
            </button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-16 px-4 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {data.hero.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed">
              {data.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/order">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  Pesan Sekarang
                </button>
              </Link>
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-gray-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white p-6 rounded-lg shadow-2xl">
              <img
                src={`${data.hero.heroImage || "/images/hero-section.webp"}${data.hero.heroImage ? `?t=${Date.now()}` : ''}`}
                alt="FloodBar Sekat Pintu Anti Banjir"
                className="w-full h-80 md:h-96 object-cover rounded-lg"
                key={data.hero.heroImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero-section.webp'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className="py-16 px-4 bg-white">
            <h2 className="text-3xl md:text-4xl font-bold text-center w-2/3 mx-auto text-gray-900 mb-6">
              {data.service?.title || "FloodBar - Sekat Pintu Anti Banjir Custom"}
            </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {data.service?.description || "FloodBar adalah solusi sekat pintu anti banjir yang dibuat custom sesuai lebar pintu rumah Anda. Dengan sistem pre-order, setiap FloodBar diproduksi khusus untuk memastikan fit yang sempurna dan perlindungan maksimal saat banjir datang."}
            </p>
            <p className="text-gray-600 mb-8">
              {data.service?.process || "Cara Pesan: Ukur lebar pintu → Pre-order FloodBar → Proses produksi 5-7 hari → Terima FloodBar yang pas sempurna. Material aluminium premium dengan rubber seal memastikan tidak ada air yang bisa masuk melalui pintu Anda."}
            </p>
            <Link href="/order">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Pesan Sekarang
              </button>
            </Link>
          </div>
          
          <div className="relative">
            <img
              src={`${data.service?.image || "/images/product-about.webp"}${data.service?.image ? `?t=${Date.now()}` : ''}`}
              alt="FloodBar Installation"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              key={data.service?.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/product-about.webp'
              }}
            />
          </div>
        </div>
      </section>

      {/* What Matters Most Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Mengapa Memilih FloodBar.id?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {data.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Star
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-400">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comparison Table */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Tabel Perbandingan Biaya Perlindungan Rumah</h3>
              <p className="text-gray-400">Mengapa FloodBar.id adalah pilihan yang tepat</p>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fitur</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white bg-green-600">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>FloodBar.id</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">BRAND LAIN</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">Harga</td>
                    <td className="px-6 py-5 text-center bg-green-50">
                      <div className="text-sm font-bold text-green-700">Rp 300.000–Rp 600.000</div>
                      <div className="text-xs text-green-600">(disesuaikan)</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm font-bold text-red-600">Rp 1.500.000 ke atas</div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">Bahan</td>
                    <td className="px-6 py-5 text-center bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Besi berkualitas tinggi, kuat & ringan</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-gray-700">Bahan premium tapi mahal</div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">Durabilitas</td>
                    <td className="px-6 py-5 text-center bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Tahan bertahun-tahun, kuat menghadapi cuaca ekstrem</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-gray-700">Tergantung produk</div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">Pemasangan</td>
                    <td className="px-6 py-5 text-center bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Praktis, bisa dipasang sendiri</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-gray-700">Biasanya memerlukan jasa profesional</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-6">
              {/* Header Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">FloodBar.id</span>
                  </div>
                  <p className="text-xs text-green-100">Pilihan Terbaik</p>
                </div>
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-4 text-white text-center">
                  <div className="font-bold mb-2">BRAND LAIN</div>
                  <p className="text-xs text-gray-300">Kompetitor</p>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="space-y-4">
                {/* Harga */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h4 className="font-semibold text-gray-900">💰 Harga</h4>
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-gray-300">
                    <div className="p-4 bg-green-50">
                      <div className="text-sm font-bold text-green-700">Rp 300.000–Rp 600.000</div>
                      <div className="text-xs text-green-600">(disesuaikan)</div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-bold text-red-600">Rp 1.500.000 ke atas</div>
                    </div>
                  </div>
                </div>

                {/* Bahan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h4 className="font-semibold text-gray-900">🔧 Bahan</h4>
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-gray-300">
                    <div className="p-4 bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Besi berkualitas tinggi, kuat & ringan</div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-700">Bahan premium tapi mahal</div>
                    </div>
                  </div>
                </div>

                {/* Durabilitas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h4 className="font-semibold text-gray-900">⚡ Durabilitas</h4>
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-gray-300">
                    <div className="p-4 bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Tahan bertahun-tahun, kuat menghadapi cuaca ekstrem</div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-700">Tergantung produk</div>
                    </div>
                  </div>
                </div>

                {/* Pemasangan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h4 className="font-semibold text-gray-900">🔨 Pemasangan</h4>
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-gray-300">
                    <div className="p-4 bg-green-50">
                      <div className="text-sm font-semibold text-green-700">Praktis, bisa dipasang sendiri</div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-700">Biasanya memerlukan jasa profesional</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Kesimpulan: FloodBar.id Lebih Unggul!</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-2">💰 Harga Terjangkau</h5>
                  <p className="text-sm text-gray-700">Hemat hingga 60% dibanding kompetitor tanpa mengorbankan kualitas</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-blue-700 mb-2">🛠️ Mudah Dipasang</h5>
                  <p className="text-sm text-gray-700">Tidak perlu teknisi profesional, bisa dipasang sendiri dengan mudah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              FloodBar - Sekat Pintu Anti Banjir Custom
            </h2>
            <p className="text-lg text-gray-600">
              Perlindungan maksimal untuk rumah Anda dengan desain custom sesuai ukuran pintu
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {data.products.filter(product => product.name.toLowerCase().includes('model a')).map((product, index) => {
              const fallbackImage = '/images/product-a.webp'

              return (
              <div key={index} className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="relative mb-6">
                  <img
                    src={`${product.image || fallbackImage}${product.image ? `?t=${Date.now()}` : ''}`}
                    alt={product.name}
                    className="w-full h-80 md:h-96 object-contain rounded-lg bg-white"
                    key={product.image}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage
                    }}
                  />
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">FloodBar Premium</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                </div>
                
                <div className="space-y-3 flex-grow">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">✨ Keunggulan:</h4>
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">💰 Contoh Harga:</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-800 font-medium">Ukuran 60 × 40 = <span className="text-blue-700 font-bold">Rp 448.000</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/order">
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors w-full">
                      🛡️ Pesan FloodBar Sekarang
                    </button>
                  </Link>
                </div>
              </div>
              )
            })}
          </div>
          
          <div className="mt-16">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Panduan Mengukur Pintu untuk FloodBar</h3>
                <p className="text-gray-600">Pelajari cara mengukur pintu dengan tepat sebelum memesan FloodBar custom Anda</p>
              </div>

              {/* Video Tutorial Section */}
              <div className="mb-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-[9/16] relative">
                    <iframe
                      src="https://www.youtube.com/embed/wOHYxURCmrw"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Tutorial Cara Mengukur Pintu untuk FloodBar"
                    />
                  </div>
                  <div className="p-4 text-center bg-gradient-to-r from-blue-600 to-blue-700">
                    <h4 className="font-semibold text-white">Tutorial Cara Mengukur Pintu untuk FloodBar</h4>
                    <p className="text-sm text-blue-100 mt-1">Pelajari cara mengukur pintu dengan tepat sebelum memesan</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Langkah-langkah Mengukur Pintu</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">1</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Ukur Lebar Pintu</h5>
                    <p className="text-gray-600 text-sm">Ukur lebar dari ujung luar daun pintu kiri ke ujung daun pintu kanan, ukur di kedua sisi yaitu bagian atas dan bawah supaya lebih presisi</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">2</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Ukur Tinggi</h5>
                    <p className="text-gray-600 text-sm">Ukur tinggi yang dibutuhkan, minimal 50cm untuk perlindungan optimal</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">3</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Catat Ukuran</h5>
                    <p className="text-gray-600 text-sm">Catat ukuran dengan akurat dan masukkan saat pemesanan</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/order">
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      🛡️ Pesan FloodBar Sekarang
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel Section */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Testimoni Pelanggan FloodBar.id
              </h2>
              <p className="text-lg text-gray-600">
                Dengarkan pengalaman nyata pelanggan yang telah menggunakan FloodBar custom
              </p>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
                <div className="p-8 md:p-12">
                  <div className="text-center">
                    <div 
                      className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-6 bg-cover bg-center shadow-lg"
                      style={{
                        backgroundImage: `url('${data.testimonials[currentTestimonial]?.image || "https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg"}')`
                      }}
                    ></div>
                    
                    <div className="flex justify-center mb-6">
                      {[...Array(data.testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-current" size={20} />
                      ))}
                    </div>
                    
                    <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
                      "{data.testimonials[currentTestimonial]?.text || ''}"
                    </blockquote>
                    
                    <div>
                      <p className="font-bold text-xl text-gray-900">{data.testimonials[currentTestimonial]?.name || ''}</p>
                      <p className="text-gray-600">{data.testimonials[currentTestimonial]?.location || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-blue-50"
              >
                <ChevronLeft className="w-6 h-6 text-blue-600" />
              </button>
              
              <button 
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-blue-50"
              >
                <ChevronRight className="w-6 h-6 text-blue-600" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-8 space-x-2">
                {data.testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentTestimonial 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {data.faq?.title || "FAQ FloodBar - Sekat Pintu Anti Banjir Custom"}
            </h2>
          </div>
          
          <div className="space-y-4">
            {data.faq?.questions?.map((faq, index) => (
              <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
            )) || (
              // Fallback FAQ if no data
              <>
                <FAQAccordion 
                  question="Berapa lama proses pre-order FloodBar custom?"
                  answer="FloodBar Standard: 5-7 hari kerja. FloodBar Premium: 7-10 hari kerja. Waktu produksi tergantung kompleksitas ukuran custom dan ketersediaan material."
                />
                <FAQAccordion 
                  question="Bagaimana cara mengukur lebar pintu yang benar?"
                  answer="Ukur lebar dalam kusen pintu (dari dinding ke dinding). Tambahkan toleransi 2-3cm untuk pemasangan yang optimal. Tim kami akan membantu konfirmasi ukuran sebelum produksi."
                />
              </>
            )}
          </div>
          
        </div>
      </section>

      {/* Flood Information Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* News Cards Section */}
            <div className="space-y-4">
              {news.length > 0 ? (
                news.map((newsItem, index) => {
                  const colors = ['bg-orange-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600']
                  const firstLetter = newsItem.sourceName?.charAt(0)?.toUpperCase() || 'N'
                  
                  return (
                    <a
                      key={newsItem.id}
                      href={newsItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                    >
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                          {newsItem.imageUrl ? (
                            <img 
                              src={newsItem.imageUrl}
                              alt={newsItem.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                            {newsItem.title}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {new Date(newsItem.publishedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })} — {newsItem.summary}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className={`w-4 h-4 ${colors[index % colors.length]} rounded-full mr-2 flex items-center justify-center`}>
                              <span className="text-white text-xs">{firstLetter}</span>
                            </div>
                            <span>{newsItem.sourceName}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                })
              ) : (
                // Fallback news if no data from database
                <>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src="https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg"
                          alt="Banjir" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm mb-1">Banjir di Indonesia Semakin Sering Terjadi</h4>
                        <p className="text-xs text-gray-400 mb-2">Data menunjukkan peningkatan kejadian banjir di berbagai daerah...</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 flex items-center justify-center">
                            <span className="text-white text-xs">N</span>
                          </div>
                          <span>FloodBar News</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {data.floodInfo?.title || "Kenapa FloodBar.id Solusi Terbaik?"}
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {data.floodInfo?.description || "Banjir di Indonesia semakin sering terjadi. Jakarta, Bekasi, Tangerang, Bogor, dan kota-kota lainnya rutin mengalami genangan setiap musim hujan. Kerugian mencapai jutaan rupiah karena kerusakan furniture, elektronik, dan renovasi rumah."}
              </p>
              <p className="text-gray-300 mb-8">
                {data.floodInfo?.description2 || "FloodBar.id hadir dengan solusi sekat pintu anti banjir yang dibuat custom untuk setiap rumah. Sistem pre-order memastikan FloodBar fit sempurna di pintu Anda. Investasi ratusan ribu untuk melindungi aset jutaan rupiah."}
              </p>
              
              {/* Flood Statistics Iframe */}
              <div className="mb-8 rounded-lg overflow-hidden bg-white p-4">
                <iframe 
                  src="https://data.goodstats.id/statistic/embed/jateng-jabar-dan-jatim-jadi-provinsi-langganan-banjir-awal-2025-NLKMk" 
                  frameBorder="0" 
                  style={{height: '500px', width: '100%'}}
                  title="Statistik Banjir Provinsi Indonesia"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                {data.floodInfo?.stats?.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                )) || (
                  // Fallback stats if no data
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">Custom</div>
                      <div className="text-sm text-gray-400">Ukuran Presisi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">500+</div>
                      <div className="text-sm text-gray-400">FloodBar Terpasang</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">5-10</div>
                      <div className="text-sm text-gray-400">Hari Pre-Order</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TikTok Videos Section */}
      {data && data.videos && data.videos.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Video FloodBar
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Lihat bagaimana FloodBar bekerja melindungi rumah Anda dari banjir
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.videos.filter(video => video.isActive).map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-[9/16] relative">
                    <iframe
                      src={video.embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-center">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Pre-Order FloodBar Custom Anda?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            Jangan tunggu banjir datang! Pre-order FloodBar sekarang dan dapatkan sekat pintu anti banjir 
            yang dibuat khusus sesuai ukuran pintu rumah Anda. Konsultasi gratis untuk desain custom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <button className="bg-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg">
                🚨 Pre-Order FloodBar Sekarang
              </button>
            </Link>
          </div>
          
          {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">✅ Custom Fit</h3>
              <p className="text-gray-300 text-sm">Dibuat sesuai ukuran pintu Anda</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">⏱️ Pre-Order</h3>
              <p className="text-gray-300 text-sm">Proses produksi 5-10 hari kerja</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">🛡️ Perlindungan</h3>
              <p className="text-gray-300 text-sm">Tahan air hingga 50-70cm</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
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
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              {settings?.siteDescription || 'Sekat pintu anti banjir custom untuk rumah Anda. Pre-order sekarang sebelum musim hujan!'}
            </p>
            
            {/* Contact Information */}
            {data && data.contact && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
                {data.contact.phone && (
                  <div className="flex items-center justify-center space-x-2 text-gray-300">
                    <Phone size={16} />
                    <span className="text-sm">{data.contact.phone}</span>
                  </div>
                )}
                {data.contact.email && (
                  <div className="flex items-center justify-center space-x-2 text-gray-300">
                    <Mail size={16} />
                    <span className="text-sm">{data.contact.email}</span>
                  </div>
                )}
                {data.contact.address && (
                  <div className="flex items-center justify-center space-x-2 text-gray-300">
                    <MapPin size={16} />
                    <span className="text-sm">{data.contact.address}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Social Media Links */}
            {(settings?.instagramUrl || settings?.facebookUrl || settings?.tiktokUrl) && (
              <div className="flex justify-center space-x-4 mb-6">
                {settings.instagramUrl && (
                  <a 
                    href={settings.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full hover:opacity-80 transition-opacity"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a 
                    href={settings.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-3 rounded-full hover:opacity-80 transition-opacity"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a 
                    href={settings.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black p-3 rounded-full hover:opacity-80 transition-opacity"
                  >
                    <Play size={20} />
                  </a>
                )}
              </div>
            )}
            
            <p className="text-gray-400">
              © 2025 {settings?.siteName || 'FloodBar.id'} - Semua hak dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${data?.contact?.phone?.replace(/[^0-9]/g, '') || '6281234567890'}?text=Halo,%20saya%20tertarik%20dengan%20FloodBar%20custom%20untuk%20rumah%20saya`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:shadow-xl z-50"
      >
        <MessageCircle size={24} />
      </a>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  )
}