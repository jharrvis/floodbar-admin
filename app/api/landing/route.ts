import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    const landingPageResult = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        heroTitle,
        heroSubtitle, 
        heroBackgroundImage,
        heroImage,
        serviceJson,
        featuresJson,
        productsJson,
        faqJson,
        floodInfoJson,
        testimonialsJson,
        contactPhone,
        contactEmail,
        contactAddress,
        createdAt,
        updatedAt
      FROM landing_pages 
      ORDER BY createdAt DESC 
      LIMIT 1
    `) as any[]

    const landingPage = landingPageResult.length > 0 ? landingPageResult[0] : null

    if (!landingPage) {
      // Return default data if no landing page found
      const defaultData: LandingPageData = {
        hero: {
          title: 'FloodBar - Sekat Pintu Anti Banjir Custom untuk Rumah Anda',
          subtitle: 'Lindungi rumah dari banjir dengan FloodBar yang dibuat custom sesuai lebar pintu Anda. Sistem pre-order memastikan ukuran yang pas dan perlindungan maksimal saat musim hujan tiba.',
          backgroundImage: '/hero-bg.jpg',
          heroImage: 'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg'
        },
        service: {
          title: 'FloodBar - Sekat Pintu Anti Banjir Custom',
          description: 'FloodBar adalah solusi sekat pintu anti banjir yang dibuat custom sesuai lebar pintu rumah Anda. Dengan sistem pre-order, setiap FloodBar diproduksi khusus untuk memastikan fit yang sempurna dan perlindungan maksimal saat banjir datang.',
          process: 'Cara Pesan: Ukur lebar pintu → Pre-order FloodBar → Proses produksi 5-7 hari → Terima FloodBar yang pas sempurna. Material aluminium premium dengan rubber seal memastikan tidak ada air yang bisa masuk melalui pintu Anda.',
          image: 'https://cdn.pixabay.com/photo/2020/04/18/08/33/house-5058226_1280.jpg'
        },
        features: [
          {
            title: 'Custom Fit',
            description: 'Setiap FloodBar dibuat khusus sesuai lebar pintu rumah Anda. Ukur, pesan, pasang - sempurna!',
            icon: 'wrench'
          },
          {
            title: 'Pre-Order System',
            description: 'Pesan sekarang sebelum musim hujan. Proses produksi 5-7 hari kerja untuk hasil yang optimal.',
            icon: 'star'
          },
          {
            title: 'Mudah Dipasang',
            description: 'Instalasi cepat tanpa alat khusus. Dalam 5 menit FloodBar siap melindungi rumah Anda.',
            icon: 'shield'
          }
        ],
        products: [
          {
            name: 'Model A',
            description: 'Sekat pintu anti banjir dengan tinggi 60cm, cocok untuk rumah tinggal standard',
            image: 'https://cdn.pixabay.com/photo/2023/05/15/10/55/door-8013011_1280.jpg',
            features: [
              'Tinggi 60cm, custom lebar sesuai pintu',
              'Material aluminium + rubber seal',
              'Tahan tekanan air hingga 50cm',
              'Pre-order 5-7 hari kerja',
              'Garansi 2 tahun'
            ]
          },
          {
            name: 'Model B',
            description: 'Sekat pintu heavy duty dengan tinggi 80cm untuk perlindungan maksimal',
            image: 'https://cdn.pixabay.com/photo/2016/11/30/12/24/door-1873464_1280.jpg',
            features: [
              'Tinggi 80cm, custom lebar sesuai pintu',
              'Material stainless steel premium',
              'Tahan tekanan air hingga 70cm',
              'Pre-order 7-10 hari kerja',
              'Garansi 5 tahun + maintenance'
            ]
          }
        ],
        faq: {
          title: 'FAQ FloodBar - Sekat Pintu Anti Banjir Custom',
          questions: [
            {
              question: 'Berapa lama proses pre-order FloodBar custom?',
              answer: 'FloodBar Standard: 5-7 hari kerja. FloodBar Premium: 7-10 hari kerja. Waktu produksi tergantung kompleksitas ukuran custom dan ketersediaan material.'
            },
            {
              question: 'Bagaimana cara mengukur lebar pintu yang benar?',
              answer: 'Ukur lebar dalam kusen pintu (dari dinding ke dinding). Tambahkan toleransi 2-3cm untuk pemasangan yang optimal. Tim kami akan membantu konfirmasi ukuran sebelum produksi.'
            },
            {
              question: 'Berapa tinggi air yang bisa ditahan FloodBar?',
              answer: 'FloodBar Standard (60cm): menahan air hinggi 50cm. FloodBar Premium (80cm): menahan air hingga 70cm. Efektivitas tergantung tekanan air dan kondisi pemasangan.'
            },
            {
              question: 'Apakah bisa untuk pintu yang tidak standar?',
              answer: 'Ya! FloodBar dibuat custom sesuai ukuran pintu Anda. Pintu lengkung, lebar, atau bentuk khusus lainnya bisa disesuaikan. Konsultasi gratis untuk desain custom.'
            }
          ],
          image: 'https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg'
        },
        floodInfo: {
          title: 'Kenapa FloodBar.id Solusi Terbaik?',
          description: 'Banjir di Indonesia semakin sering terjadi. Jakarta, Bekasi, Tangerang, Bogor, dan kota-kota lainnya rutin mengalami genangan setiap musim hujan. Kerugian mencapai jutaan rupiah karena kerusakan furniture, elektronik, dan renovasi rumah.',
          description2: 'FloodBar.id hadir dengan solusi sekat pintu anti banjir yang dibuat custom untuk setiap rumah. Sistem pre-order memastikan FloodBar fit sempurna di pintu Anda. Investasi ratusan ribu untuk melindungi aset jutaan rupiah.',
          images: [
            'https://cdn.pixabay.com/photo/2017/11/09/21/41/hurricane-2934719_1280.jpg',
            'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg',
            'https://cdn.pixabay.com/photo/2018/08/31/15/20/living-room-3645325_1280.jpg',
            'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg'
          ],
          stats: [
            { value: 'Custom', label: 'Ukuran Presisi' },
            { value: '500+', label: 'FloodBar Terpasang' },
            { value: '5-10', label: 'Hari Pre-Order' }
          ]
        },
        testimonials: [
          {
            name: 'Pak Budi Santoso',
            location: 'Jakarta Barat',
            text: 'FloodBar custom fit sempurna di pintu rumah saya. Waktu banjir kemarin, air tidak masuk sama sekali. Pre-order worth it banget!',
            image: 'https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg',
            rating: 5
          },
          {
            name: 'Ibu Sari Dewi',
            location: 'Bekasi',
            text: 'Pesan FloodBar 2 bulan sebelum musim hujan. Pas hujan deras kemarin, rumah aman total. Investasi terbaik!',
            image: 'https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg',
            rating: 5
          },
          {
            name: 'Pak Ahmad Rizki',
            location: 'Tangerang',
            text: 'Custom ukuran 1.2 meter pas banget dengan lebar pintu. Material kuat dan instalasi mudah. Recommended!',
            image: 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg',
            rating: 5
          },
          {
            name: 'Ibu Linda Pratiwi',
            location: 'Depok',
            text: 'Sudah 2 tahun pakai FloodBar, masih bagus dan efektif. Pre-order memang butuh sabar tapi hasilnya memuaskan.',
            image: 'https://cdn.pixabay.com/photo/2018/01/21/14/16/woman-3096664_1280.jpg',
            rating: 5
          },
          {
            name: 'Pak Hendro Wijaya',
            location: 'Bogor',
            text: 'FloodBar Premium tinggi 80cm melindungi rumah dengan sempurna. Meski mahal tapi kualitasnya sepadan.',
            image: 'https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg',
            rating: 5
          }
        ],
        contact: {
          phone: '+62 821-1234-5678',
          email: 'info@floodbar.id',
          address: 'Jakarta, Indonesia - Pengiriman Seluruh Nusantara'
        }
      }
      return NextResponse.json(defaultData)
    }

    const formattedData: LandingPageData = {
      hero: {
        title: landingPage.heroTitle,
        subtitle: landingPage.heroSubtitle,
        backgroundImage: landingPage.heroBackgroundImage || '/hero-bg.jpg',
        heroImage: landingPage.heroImage || 'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg'
      },
      service: JSON.parse(landingPage.serviceJson || JSON.stringify({
        title: 'FloodBar - Sekat Pintu Anti Banjir Custom',
        description: 'FloodBar adalah solusi sekat pintu anti banjir yang dibuat custom sesuai lebar pintu rumah Anda.',
        process: 'Cara Pesan: Ukur lebar pintu → Pre-order FloodBar → Proses produksi 5-7 hari → Terima FloodBar yang pas sempurna.',
        image: 'https://cdn.pixabay.com/photo/2020/04/18/08/33/house-5058226_1280.jpg'
      })),
      features: JSON.parse(landingPage.featuresJson || JSON.stringify([
        {
          title: 'Custom Fit',
          description: 'Setiap FloodBar dibuat khusus sesuai lebar pintu rumah Anda. Ukur, pesan, pasang - sempurna!',
          icon: 'wrench'
        },
        {
          title: 'Pre-Order System',
          description: 'Pesan sekarang sebelum musim hujan. Proses produksi 5-7 hari kerja untuk hasil yang optimal.',
          icon: 'star'
        },
        {
          title: 'Mudah Dipasang',
          description: 'Instalasi cepat tanpa alat khusus. Dalam 5 menit FloodBar siap melindungi rumah Anda.',
          icon: 'shield'
        }
      ])),
      products: JSON.parse(landingPage.productsJson || JSON.stringify([
        {
          name: 'Model A',
          description: 'Sekat pintu anti banjir dengan tinggi 60cm, cocok untuk rumah tinggal standard',
          image: 'https://cdn.pixabay.com/photo/2023/05/15/10/55/door-8013011_1280.jpg',
          features: [
            'Tinggi 60cm, custom lebar sesuai pintu',
            'Material aluminium + rubber seal',
            'Tahan tekanan air hingga 50cm',
            'Pre-order 5-7 hari kerja',
            'Garansi 2 tahun'
          ]
        },
        {
          name: 'Model B',
          description: 'Sekat pintu heavy duty dengan tinggi 80cm untuk perlindungan maksimal',
          image: 'https://cdn.pixabay.com/photo/2016/11/30/12/24/door-1873464_1280.jpg',
          features: [
            'Tinggi 80cm, custom lebar sesuai pintu',
            'Material stainless steel premium',
            'Tahan tekanan air hingga 70cm',
            'Pre-order 7-10 hari kerja',
            'Garansi 5 tahun + maintenance'
          ]
        }
      ])),
      faq: JSON.parse(landingPage.faqJson || JSON.stringify({
        title: 'FAQ FloodBar - Sekat Pintu Anti Banjir Custom',
        questions: [
          {
            question: 'Berapa lama proses pre-order FloodBar custom?',
            answer: 'FloodBar Standard: 5-7 hari kerja. FloodBar Premium: 7-10 hari kerja. Waktu produksi tergantung kompleksitas ukuran custom dan ketersediaan material.'
          },
          {
            question: 'Bagaimana cara mengukur lebar pintu yang benar?',
            answer: 'Ukur lebar dalam kusen pintu (dari dinding ke dinding). Tambahkan toleransi 2-3cm untuk pemasangan yang optimal. Tim kami akan membantu konfirmasi ukuran sebelum produksi.'
          },
          {
            question: 'Berapa tinggi air yang bisa ditahan FloodBar?',
            answer: 'FloodBar Standard (60cm): menahan air hinggi 50cm. FloodBar Premium (80cm): menahan air hingga 70cm. Efektivitas tergantung tekanan air dan kondisi pemasangan.'
          },
          {
            question: 'Apakah bisa untuk pintu yang tidak standar?',
            answer: 'Ya! FloodBar dibuat custom sesuai ukuran pintu Anda. Pintu lengkung, lebar, atau bentuk khusus lainnya bisa disesuaikan. Konsultasi gratis untuk desain custom.'
          }
        ],
        image: 'https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg'
      })),
      floodInfo: JSON.parse(landingPage.floodInfoJson || JSON.stringify({
        title: 'Kenapa FloodBar.id Solusi Terbaik?',
        description: 'Banjir di Indonesia semakin sering terjadi. Jakarta, Bekasi, Tangerang, Bogor, dan kota-kota lainnya rutin mengalami genangan setiap musim hujan. Kerugian mencapai jutaan rupiah karena kerusakan furniture, elektronik, dan renovasi rumah.',
        description2: 'FloodBar.id hadir dengan solusi sekat pintu anti banjir yang dibuat custom untuk setiap rumah. Sistem pre-order memastikan FloodBar fit sempurna di pintu Anda. Investasi ratusan ribu untuk melindungi aset jutaan rupiah.',
        images: [
          'https://cdn.pixabay.com/photo/2017/11/09/21/41/hurricane-2934719_1280.jpg',
          'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg',
          'https://cdn.pixabay.com/photo/2018/08/31/15/20/living-room-3645325_1280.jpg',
          'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg'
        ],
        stats: [
          { value: 'Custom', label: 'Ukuran Presisi' },
          { value: '500+', label: 'FloodBar Terpasang' },
          { value: '5-10', label: 'Hari Pre-Order' }
        ]
      })),
      testimonials: JSON.parse(landingPage.testimonialsJson || JSON.stringify([
        {
          name: 'Pak Budi Santoso',
          location: 'Jakarta Barat',
          text: 'FloodBar custom fit sempurna di pintu rumah saya. Waktu banjir kemarin, air tidak masuk sama sekali. Pre-order worth it banget!',
          image: 'https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg',
          rating: 5
        },
        {
          name: 'Ibu Sari Dewi',
          location: 'Bekasi',
          text: 'Pesan FloodBar 2 bulan sebelum musim hujan. Pas hujan deras kemarin, rumah aman total. Investasi terbaik!',
          image: 'https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg',
          rating: 5
        },
        {
          name: 'Pak Ahmad Rizki',
          location: 'Tangerang',
          text: 'Custom ukuran 1.2 meter pas banget dengan lebar pintu. Material kuat dan instalasi mudah. Recommended!',
          image: 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2693617_1280.jpg',
          rating: 5
        },
        {
          name: 'Ibu Linda Pratiwi',
          location: 'Depok',
          text: 'Sudah 2 tahun pakai FloodBar, masih bagus dan efektif. Pre-order memang butuh sabar tapi hasilnya memuaskan.',
          image: 'https://cdn.pixabay.com/photo/2018/01/21/14/16/woman-3096664_1280.jpg',
          rating: 5
        },
        {
          name: 'Pak Hendro Wijaya',
          location: 'Bogor',
          text: 'FloodBar Premium tinggi 80cm melindungi rumah dengan sempurna. Meski mahal tapi kualitasnya sepadan.',
          image: 'https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg',
          rating: 5
        }
      ])),
      contact: {
        phone: landingPage.contactPhone || '+62 821-1234-5678',
        email: landingPage.contactEmail || 'info@floodbar.id',
        address: landingPage.contactAddress || 'Jakarta, Indonesia - Pengiriman Seluruh Nusantara'
      }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: LandingPageData = await request.json()

    // Check if landing page exists
    const existingLandingPageResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM landing_pages LIMIT 1
    `) as any[]

    const landingPageData = {
      heroTitle: data.hero.title,
      heroSubtitle: data.hero.subtitle,
      heroBackgroundImage: data.hero.backgroundImage,
      heroImage: data.hero.heroImage,
      serviceJson: JSON.stringify(data.service),
      featuresJson: JSON.stringify(data.features),
      productsJson: JSON.stringify(data.products),
      faqJson: JSON.stringify(data.faq),
      floodInfoJson: JSON.stringify(data.floodInfo),
      testimonialsJson: JSON.stringify(data.testimonials),
      contactPhone: data.contact.phone,
      contactEmail: data.contact.email,
      contactAddress: data.contact.address
    }

    if (existingLandingPageResult && existingLandingPageResult.length > 0) {
      // Update existing landing page
      await prisma.$executeRawUnsafe(`
        UPDATE landing_pages 
        SET heroTitle = ?, heroSubtitle = ?, heroBackgroundImage = ?, heroImage = ?,
            serviceJson = ?, featuresJson = ?, productsJson = ?, faqJson = ?,
            floodInfoJson = ?, testimonialsJson = ?, contactPhone = ?,
            contactEmail = ?, contactAddress = ?, updatedAt = NOW()
        WHERE id = ?
      `,
        landingPageData.heroTitle, landingPageData.heroSubtitle, landingPageData.heroBackgroundImage, landingPageData.heroImage,
        landingPageData.serviceJson, landingPageData.featuresJson, landingPageData.productsJson, landingPageData.faqJson,
        landingPageData.floodInfoJson, landingPageData.testimonialsJson, landingPageData.contactPhone,
        landingPageData.contactEmail, landingPageData.contactAddress, existingLandingPageResult[0].id
      )
    } else {
      // Create new landing page
      await prisma.$executeRawUnsafe(`
        INSERT INTO landing_pages (
          id, heroTitle, heroSubtitle, heroBackgroundImage, heroImage,
          serviceJson, featuresJson, productsJson, faqJson, floodInfoJson,
          testimonialsJson, contactPhone, contactEmail, contactAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'landing-' + Date.now(),
        landingPageData.heroTitle, landingPageData.heroSubtitle, landingPageData.heroBackgroundImage, landingPageData.heroImage,
        landingPageData.serviceJson, landingPageData.featuresJson, landingPageData.productsJson, landingPageData.faqJson,
        landingPageData.floodInfoJson, landingPageData.testimonialsJson, landingPageData.contactPhone,
        landingPageData.contactEmail, landingPageData.contactAddress
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        hero: {
          title: landingPageData.heroTitle,
          subtitle: landingPageData.heroSubtitle,
          backgroundImage: landingPageData.heroBackgroundImage,
          heroImage: landingPageData.heroImage
        },
        service: JSON.parse(landingPageData.serviceJson),
        features: JSON.parse(landingPageData.featuresJson),
        products: JSON.parse(landingPageData.productsJson),
        faq: JSON.parse(landingPageData.faqJson),
        floodInfo: JSON.parse(landingPageData.floodInfoJson),
        testimonials: JSON.parse(landingPageData.testimonialsJson),
        contact: {
          phone: landingPageData.contactPhone,
          email: landingPageData.contactEmail,
          address: landingPageData.contactAddress
        }
      }
    })
  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}