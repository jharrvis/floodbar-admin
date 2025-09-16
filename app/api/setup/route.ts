import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Create videos table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        embedUrl VARCHAR(500) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Videos table created successfully' 
    })
  } catch (error) {
    console.error('Error creating videos table:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create videos table' },
      { status: 500 }
    )
  }
}