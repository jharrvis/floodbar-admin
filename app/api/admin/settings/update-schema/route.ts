import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create system_settings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(255) PRIMARY KEY,
        siteName VARCHAR(255) NOT NULL DEFAULT 'FloodBar Admin Panel',
        siteDescription TEXT,
        adminEmail VARCHAR(255),
        maintenanceMode BOOLEAN DEFAULT FALSE,
        allowRegistration BOOLEAN DEFAULT FALSE,
        emailNotifications BOOLEAN DEFAULT TRUE,
        backupFrequency VARCHAR(50) DEFAULT 'daily',
        timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
        language VARCHAR(10) DEFAULT 'id',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create cloudinary_settings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS cloudinary_settings (
        id VARCHAR(255) PRIMARY KEY,
        cloudName VARCHAR(255) NOT NULL,
        apiKey VARCHAR(255) NOT NULL,
        apiSecret VARCHAR(255) NOT NULL,
        uploadPreset VARCHAR(255) DEFAULT 'floodbar_uploads',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Settings database schema created successfully' 
    })
  } catch (error) {
    console.error('Error creating settings schema:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create settings schema' },
      { status: 500 }
    )
  }
}