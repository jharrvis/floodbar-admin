import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Update landing_pages table to include all sections
    await prisma.$executeRawUnsafe(`
      ALTER TABLE landing_pages 
      ADD COLUMN IF NOT EXISTS heroImage TEXT,
      ADD COLUMN IF NOT EXISTS serviceJson JSON,
      ADD COLUMN IF NOT EXISTS faqJson JSON,
      ADD COLUMN IF NOT EXISTS floodInfoJson JSON,
      ADD COLUMN IF NOT EXISTS testimonialsJson JSON,
      ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema updated successfully' 
    })
  } catch (error) {
    console.error('Error updating schema:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schema' },
      { status: 500 }
    )
  }
}