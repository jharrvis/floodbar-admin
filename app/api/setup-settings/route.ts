import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create system_settings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(255) PRIMARY KEY,
        siteName VARCHAR(255) NOT NULL,
        siteDescription TEXT,
        adminEmail VARCHAR(255) NOT NULL,
        timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
        language VARCHAR(10) DEFAULT 'id',
        maintenanceMode BOOLEAN DEFAULT FALSE,
        allowRegistration BOOLEAN DEFAULT FALSE,
        emailNotifications BOOLEAN DEFAULT TRUE,
        backupFrequency VARCHAR(50) DEFAULT 'daily',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Insert default settings if none exists
    const existingSettings = await prisma.$queryRawUnsafe(`
      SELECT id FROM system_settings LIMIT 1
    `) as any[]

    if (!existingSettings || existingSettings.length === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO system_settings (
          id, siteName, siteDescription, adminEmail, timezone, language,
          maintenanceMode, allowRegistration, emailNotifications, backupFrequency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'settings-default',
        'Floodbar Admin Panel',
        'Admin panel untuk mengelola halaman penjualan floodbar',
        'admin@floodbar.com',
        'Asia/Jakarta',
        'id',
        false,
        false,
        true,
        'daily'
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'System settings table created successfully' 
    })
  } catch (error) {
    console.error('Error setting up system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup system settings table' },
      { status: 500 }
    )
  }
}