'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Star, Shield, Wrench, Droplets, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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

const iconMap: { [key: string]: any } = {
  wrench: Wrench,
  shield: Shield,
  droplets: Droplets,
  star: Star,
}

export default function HomePage() {
  const [data, setData] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)

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
      {/* Hero Section */}
      <section className="relative bg-primary-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {data.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {data.hero.subtitle}
          </p>
          <div className="space-x-4">
            <Link href="/order">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Pesan Sekarang
              </button>
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Lihat Produk
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-primary-700 opacity-90"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih FloodBar?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Solusi terdepan untuk perlindungan anti banjir dengan teknologi dan kualitas terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Star
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Produk Unggulan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih solusi FloodBar yang sesuai dengan kebutuhan Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Product Image</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-3xl font-bold text-primary-600 mb-4">{product.price}</p>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="text-green-500 mr-2" size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/order">
                    <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      Pesan Sekarang
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Testimoni Pelanggan
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "FloodBar sangat membantu melindungi rumah kami dari banjir. Pemasangan mudah dan hasilnya sangat memuaskan!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">Budi Santoso</p>
                    <p className="text-sm text-gray-500">Jakarta Selatan</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-primary-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hubungi Kami
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              Siap membantu Anda melindungi properti dari banjir. Konsultasi gratis!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Telepon</h3>
              <p className="text-primary-100">{data.contact.phone}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-primary-100">{data.contact.email}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Alamat</h3>
              <p className="text-primary-100">{data.contact.address}</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/order">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Pesan Sekarang
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 FloodBar. Semua hak dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  )
}