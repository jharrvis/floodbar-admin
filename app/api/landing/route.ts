import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

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

export async function GET() {
  try {
    const landingPage = await prisma.landingPage.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!landingPage) {
      // Return default data if no landing page found
      const defaultData: LandingPageData = {
        hero: {
          title: 'FloodBar - Sekat Pintu Anti Banjir Terdepan',
          subtitle: 'Lindungi rumah dan bisnis Anda dari banjir dengan solusi inovatif FloodBar. Mudah dipasang, tahan lama, dan efektif.',
          backgroundImage: '/hero-bg.jpg'
        },
        features: [
          {
            title: 'Mudah Dipasang',
            description: 'Instalasi cepat tanpa perlu keahlian khusus. Cukup 5 menit untuk perlindungan maksimal.',
            icon: 'wrench'
          },
          {
            title: 'Tahan Lama',
            description: 'Material berkualitas tinggi yang tahan terhadap cuaca ekstrem dan tekanan air.',
            icon: 'shield'
          },
          {
            title: 'Efektif',
            description: 'Mampu menahan air hingga ketinggian 1.5 meter dengan sistem kedap air yang sempurna.',
            icon: 'droplets'
          }
        ],
        products: [
          {
            name: 'FloodBar Basic',
            price: 'Rp 2.500.000',
            description: 'Solusi dasar untuk pintu standar rumah tinggal',
            image: '/product-basic.jpg',
            features: [
              'Tinggi maksimal 1 meter',
              'Lebar hingga 1.2 meter',
              'Material aluminium',
              'Garansi 2 tahun'
            ]
          },
          {
            name: 'FloodBar Pro',
            price: 'Rp 4.500.000',
            description: 'Solusi profesional untuk bangunan komersial',
            image: '/product-pro.jpg',
            features: [
              'Tinggi maksimal 1.5 meter',
              'Lebar hingga 2 meter',
              'Material stainless steel',
              'Garansi 5 tahun'
            ]
          }
        ],
        contact: {
          phone: '+62 21 1234-5678',
          email: 'info@floodbar.com',
          address: 'Jl. Contoh No. 123, Jakarta Selatan'
        }
      }
      return NextResponse.json(defaultData)
    }

    const formattedData: LandingPageData = {
      hero: {
        title: landingPage.heroTitle,
        subtitle: landingPage.heroSubtitle,
        backgroundImage: landingPage.heroBackgroundImage || '/hero-bg.jpg'
      },
      features: JSON.parse(landingPage.featuresJson),
      products: JSON.parse(landingPage.productsJson),
      contact: {
        phone: landingPage.contactPhone,
        email: landingPage.contactEmail,
        address: landingPage.contactAddress
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
    const existingLandingPage = await prisma.landingPage.findFirst()

    const landingPageData = {
      heroTitle: data.hero.title,
      heroSubtitle: data.hero.subtitle,
      heroBackgroundImage: data.hero.backgroundImage,
      featuresJson: JSON.stringify(data.features),
      productsJson: JSON.stringify(data.products),
      contactPhone: data.contact.phone,
      contactEmail: data.contact.email,
      contactAddress: data.contact.address
    }

    let updatedLandingPage

    if (existingLandingPage) {
      // Update existing landing page
      updatedLandingPage = await prisma.landingPage.update({
        where: { id: existingLandingPage.id },
        data: landingPageData
      })
    } else {
      // Create new landing page
      updatedLandingPage = await prisma.landingPage.create({
        data: landingPageData
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        hero: {
          title: updatedLandingPage.heroTitle,
          subtitle: updatedLandingPage.heroSubtitle,
          backgroundImage: updatedLandingPage.heroBackgroundImage
        },
        features: JSON.parse(updatedLandingPage.featuresJson),
        products: JSON.parse(updatedLandingPage.productsJson),
        contact: {
          phone: updatedLandingPage.contactPhone,
          email: updatedLandingPage.contactEmail,
          address: updatedLandingPage.contactAddress
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