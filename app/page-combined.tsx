'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Star, Shield, Wrench, Droplets, CheckCircle, AlertTriangle, Home, ChevronLeft, ChevronRight, ArrowUp, Instagram, Facebook, Play } from 'lucide-react'
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
}

const iconMap: { [key: string]: any } = {
  wrench: Wrench,
  shield: Shield,
  droplets: Droplets,
  star: Star,
  home: Home,
  alert: AlertTriangle,
}

export default function HomePage() {
  const [data, setData] = useState<LandingPageData | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const testimonials = [
    {
      name: "Pak Budi Santoso",
      location: "Jakarta Barat",
      image: "https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg",
      text: "FloodBar custom fit sempurna di pintu rumah saya. Waktu banjir kemarin, air tidak masuk sama sekali. Pre-order worth it banget!",
      rating: 5
    },
    {
      name: "Ibu Sari Dewi",
      location: "Bekasi",
      image: "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg", 
      text: "Pesan FloodBar 2 bulan sebelum musim hujan. Pas hujan deras kemarin, rumah aman total. Investasi terbaik!",
      rating: 5
    },
    {
      name: "Pak Ahmad Rizki",
      location: "Tangerang",
      image: "https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg",
      text: "Custom ukuran 1.2 meter pas banget dengan lebar pintu. Material kuat dan instalasi mudah. Recommended!",
      rating: 5
    },
    {
      name: "Ibu Linda Pratiwi",
      location: "Depok",
      image: "https://cdn.pixabay.com/photo/2018/01/21/14/16/woman-3096664_1280.jpg",
      text: "Sudah 2 tahun pakai FloodBar, masih bagus dan efektif. Pre-order memang butuh sabar tapi hasilnya memuaskan.",
      rating: 5
    },
    {
      name: "Pak Hendro Wijaya",
      location: "Bogor", 
      image: "https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg",
      text: "FloodBar Premium tinggi 80cm melindungi rumah dengan sempurna. Meski mahal tapi kualitasnya sepadan.",
      rating: 5
    }
  ]

  useEffect(() => {
    fetchData()
    fetchSettings()
    
    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Testimonial carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
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
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
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
            <button className="bg-green-600 px-4 py-2 rounded text-sm font-semibold hover:bg-green-700">
              Hubungi Kami
            </button>
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
                className="w-full h-64 object-cover rounded-lg mb-4"
                key={data.hero.heroImage}
              />
              <h3 className="text-gray-900 text-xl font-semibold mb-2">FloodBar Custom Fit</h3>
              <p className="text-gray-600">Sekat pintu anti banjir yang dibuat custom sesuai lebar pintu rumah Anda. Pre-order sekarang!</p>
            </div>
          </div>
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
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
              )}
              <span className="font-bold text-xl">{settings?.siteName || 'FloodBar.id'}</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              {settings?.siteDescription || 'Sekat pintu anti banjir custom untuk rumah Anda. Pre-order sekarang sebelum musim hujan!'}
            </p>
            
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
              © 2024 {settings?.siteName || 'FloodBar.id'} - Semua hak dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>

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