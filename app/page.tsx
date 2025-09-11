'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Star, Shield, Wrench, Droplets, CheckCircle, AlertTriangle, Home, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react'
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
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">FloodBar.id</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-sm">Layanan: ★★★★★</span>
            <span className="text-sm">Kualitas: ★★★★★</span>
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
                src={`${data.hero.heroImage || "https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg"}${data.hero.heroImage ? `?t=${Date.now()}` : ''}`}
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

      {/* Service Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              FloodBar - Sekat Pintu Anti Banjir Custom
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              FloodBar adalah solusi sekat pintu anti banjir yang dibuat custom sesuai lebar pintu rumah Anda. 
              Dengan sistem pre-order, setiap FloodBar diproduksi khusus untuk memastikan fit yang sempurna 
              dan perlindungan maksimal saat banjir datang.
            </p>
            <p className="text-gray-600 mb-8">
              <strong>Cara Pesan:</strong> Ukur lebar pintu → Pre-order FloodBar → Proses produksi 5-7 hari → 
              Terima FloodBar yang pas sempurna. Material aluminium premium dengan rubber seal memastikan 
              tidak ada air yang bisa masuk melalui pintu Anda.
            </p>
            <Link href="/order">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Pre-Order Sekarang
              </button>
            </Link>
          </div>
          
          <div className="relative">
            <img 
              src={`${data.service?.image || "https://cdn.pixabay.com/photo/2020/04/18/08/33/house-5058226_1280.jpg"}${data.service?.image ? `?t=${Date.now()}` : ''}`}
              alt="FloodBar Installation" 
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              key={data.service?.image}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pilihan Model FloodBar
            </h2>
            <p className="text-lg text-gray-600">
              Dua model berbeda dengan spesifikasi dan bentuk yang disesuaikan kebutuhan Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.products.map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative mb-6">
                  <img 
                    src={`${product.image}${product.image ? `?t=${Date.now()}` : ''}`}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                    key={product.image}
                  />
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Spesifikasi:</h4>
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/order">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full">
                      Pre-Order {product.name}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Kedua model memiliki harga yang sama, perbedaan hanya pada bentuk dan spesifikasi.
              Pilih sesuai kebutuhan perlindungan rumah Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Konsultasi & Pre-Order
                </button>
              </Link>
              <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Order Process Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sistem Pre-Order FloodBar Custom
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                <strong>Mengapa Pre-Order?</strong> FloodBar dibuat custom sesuai lebar pintu Anda. 
                Setiap unit diproduksi khusus setelah pesanan masuk untuk memastikan fit yang sempurna. 
                Pre-order sekarang sebelum musim hujan untuk mendapatkan perlindungan optimal.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-600"><strong>Ukur Pintu:</strong> Ukur lebar pintu/jendela yang akan dipasang FloodBar</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-600"><strong>Pre-Order:</strong> Pilih tipe FloodBar dan konfirmasi ukuran custom</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-600"><strong>Produksi:</strong> Proses pembuatan 5-10 hari kerja sesuai spesifikasi</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-600"><strong>Pengiriman:</strong> FloodBar siap dipasang, fit sempurna di pintu Anda</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/order">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto">
                    Pre-Order Sekarang
                  </button>
                </Link>
                <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto">
                  Konsultasi Custom
                </button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg"
                alt="FloodBar Custom Process" 
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              FAQ FloodBar - Sekat Pintu Anti Banjir Custom
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Berapa lama proses pre-order FloodBar custom?
                </h3>
                <p className="text-gray-600">
                  FloodBar Standard: 5-7 hari kerja. FloodBar Premium: 7-10 hari kerja. 
                  Waktu produksi tergantung kompleksitas ukuran custom dan ketersediaan material.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Bagaimana cara mengukur lebar pintu yang benar?
                </h3>
                <p className="text-gray-600">
                  Ukur lebar dalam kusen pintu (dari dinding ke dinding). Tambahkan toleransi 2-3cm 
                  untuk pemasangan yang optimal. Tim kami akan membantu konfirmasi ukuran sebelum produksi.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Berapa tinggi air yang bisa ditahan FloodBar?
                </h3>
                <p className="text-gray-600">
                  FloodBar Standard (60cm): menahan air hinggi 50cm. FloodBar Premium (80cm): 
                  menahan air hingga 70cm. Efektivitas tergantung tekanan air dan kondisi pemasangan.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Apakah bisa untuk pintu yang tidak standar?
                </h3>
                <p className="text-gray-600">
                  Ya! FloodBar dibuat custom sesuai ukuran pintu Anda. Pintu lengkung, lebar, atau 
                  bentuk khusus lainnya bisa disesuaikan. Konsultasi gratis untuk desain custom.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={`${data.faq?.image || "https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg"}${data.faq?.image ? `?t=${Date.now()}` : ''}`}
                alt="FloodBar Custom FAQ" 
                className="w-full h-full object-cover rounded-lg shadow-lg"
                key={data.faq?.image}
              />
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Pre-Order FloodBar
                </button>
              </Link>
              <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Konsultasi Custom
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flood Information Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={`${data.floodInfo?.images?.[0] || "https://cdn.pixabay.com/photo/2017/11/09/21/41/hurricane-2934719_1280.jpg"}${data.floodInfo?.images?.[0] ? `?t=${Date.now()}` : ''}`}
                alt="Flood damage" 
                className="w-full h-48 object-cover rounded-lg"
                key={data.floodInfo?.images?.[0]}
              />
              <img 
                src={`${data.floodInfo?.images?.[1] || "https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg"}${data.floodInfo?.images?.[1] ? `?t=${Date.now()}` : ''}`}
                alt="Family protection" 
                className="w-full h-48 object-cover rounded-lg"
                key={data.floodInfo?.images?.[1]}
              />
              <img 
                src={`${data.floodInfo?.images?.[2] || "https://cdn.pixabay.com/photo/2018/08/31/15/20/living-room-3645325_1280.jpg"}${data.floodInfo?.images?.[2] ? `?t=${Date.now()}` : ''}`}
                alt="Home interior" 
                className="w-full h-48 object-cover rounded-lg"
                key={data.floodInfo?.images?.[2]}
              />
              <img 
                src={`${data.floodInfo?.images?.[3] || "https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg"}${data.floodInfo?.images?.[3] ? `?t=${Date.now()}` : ''}`}
                alt="Flood protection" 
                className="w-full h-48 object-cover rounded-lg"
                key={data.floodInfo?.images?.[3]}
              />
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Kenapa FloodBar.id Solusi Terbaik?
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Banjir di Indonesia semakin sering terjadi. Jakarta, Bekasi, Tangerang, Bogor, dan kota-kota 
                lainnya rutin mengalami genangan setiap musim hujan. Kerugian mencapai jutaan rupiah karena 
                kerusakan furniture, elektronik, dan renovasi rumah.
              </p>
              <p className="text-gray-300 mb-8">
                FloodBar.id hadir dengan solusi sekat pintu anti banjir yang dibuat custom untuk setiap rumah. 
                Sistem pre-order memastikan FloodBar fit sempurna di pintu Anda. Investasi ratusan ribu untuk 
                melindungi aset jutaan rupiah.
              </p>
              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel Section */}
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
                      backgroundImage: `url('${testimonials[currentTestimonial].image}')`
                    }}
                  ></div>
                  
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  
                  <div>
                    <p className="font-bold text-xl text-gray-900">{testimonials[currentTestimonial].name}</p>
                    <p className="text-gray-600">{testimonials[currentTestimonial].location}</p>
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
              {testimonials.map((_, index) => (
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
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Konsultasi Custom Gratis
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl">FloodBar.id</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Sekat pintu anti banjir custom untuk rumah Anda. Pre-order sekarang sebelum musim hujan!
            </p>
            <p className="text-gray-400">
              © 2024 FloodBar.id - Semua hak dilindungi undang-undang.
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