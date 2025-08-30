import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

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
    const landingPageResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM landing_pages ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    const landingPage = landingPageResult.length > 0 ? landingPageResult[0] : null

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
      features: JSON.parse(landingPage.featuresJson || '[]'),
      products: JSON.parse(landingPage.productsJson || '[]'),
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
    const existingLandingPageResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM landing_pages LIMIT 1
    `) as any[]

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

    if (existingLandingPageResult && existingLandingPageResult.length > 0) {
      // Update existing landing page
      await prisma.$executeRawUnsafe(`
        UPDATE landing_pages 
        SET heroTitle = ?, heroSubtitle = ?, heroBackgroundImage = ?,
            featuresJson = ?, productsJson = ?, contactPhone = ?,
            contactEmail = ?, contactAddress = ?, updatedAt = NOW()
        WHERE id = ?
      `,
        landingPageData.heroTitle, landingPageData.heroSubtitle, landingPageData.heroBackgroundImage,
        landingPageData.featuresJson, landingPageData.productsJson, landingPageData.contactPhone,
        landingPageData.contactEmail, landingPageData.contactAddress, existingLandingPageResult[0].id
      )
    } else {
      // Create new landing page
      await prisma.$executeRawUnsafe(`
        INSERT INTO landing_pages (
          id, heroTitle, heroSubtitle, heroBackgroundImage,
          featuresJson, productsJson, contactPhone, contactEmail, contactAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'landing-' + Date.now(),
        landingPageData.heroTitle, landingPageData.heroSubtitle, landingPageData.heroBackgroundImage,
        landingPageData.featuresJson, landingPageData.productsJson, landingPageData.contactPhone,
        landingPageData.contactEmail, landingPageData.contactAddress
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        hero: {
          title: landingPageData.heroTitle,
          subtitle: landingPageData.heroSubtitle,
          backgroundImage: landingPageData.heroBackgroundImage
        },
        features: JSON.parse(landingPageData.featuresJson),
        products: JSON.parse(landingPageData.productsJson),
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