import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create landing_pages table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS landing_pages (
        id VARCHAR(255) PRIMARY KEY,
        heroTitle VARCHAR(500) NOT NULL,
        heroSubtitle TEXT,
        heroBackgroundImage VARCHAR(500),
        featuresJson JSON,
        productsJson JSON,
        contactPhone VARCHAR(50),
        contactEmail VARCHAR(255),
        contactAddress TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Landing pages table created successfully' 
    })
  } catch (error) {
    console.error('Error setting up landing pages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup landing pages table' },
      { status: 500 }
    )
  }
}