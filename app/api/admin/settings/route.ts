import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM system_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    const settings = settingsResult.length > 0 ? settingsResult[0] : {
      siteName: 'FloodBar Admin Panel',
      siteDescription: 'Admin panel untuk mengelola halaman penjualan FloodBar',
      adminEmail: 'admin@floodbar.id',
      maintenanceMode: false,
      allowRegistration: false,
      emailNotifications: true,
      backupFrequency: 'daily',
      timezone: 'Asia/Jakarta',
      language: 'id'
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({
      siteName: 'FloodBar Admin Panel',
      siteDescription: 'Admin panel untuk mengelola halaman penjualan FloodBar',
      adminEmail: 'admin@floodbar.id',
      maintenanceMode: false,
      allowRegistration: false,
      emailNotifications: true,
      backupFrequency: 'daily',
      timezone: 'Asia/Jakarta',
      language: 'id'
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      siteName,
      siteDescription,
      adminEmail,
      maintenanceMode,
      allowRegistration,
      emailNotifications,
      backupFrequency,
      timezone,
      language
    } = data

    // Check if settings exist
    const existingSettingsResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM system_settings LIMIT 1
    `) as any[]

    if (existingSettingsResult && existingSettingsResult.length > 0) {
      // Update existing settings
      await prisma.$executeRawUnsafe(`
        UPDATE system_settings 
        SET siteName = ?, siteDescription = ?, adminEmail = ?, maintenanceMode = ?,
            allowRegistration = ?, emailNotifications = ?, backupFrequency = ?,
            timezone = ?, language = ?, updatedAt = NOW()
        WHERE id = ?
      `, siteName, siteDescription, adminEmail, maintenanceMode,
         allowRegistration, emailNotifications, backupFrequency,
         timezone, language, existingSettingsResult[0].id)
    } else {
      // Create new settings
      await prisma.$executeRawUnsafe(`
        INSERT INTO system_settings (
          id, siteName, siteDescription, adminEmail, maintenanceMode,
          allowRegistration, emailNotifications, backupFrequency,
          timezone, language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 'settings-' + Date.now(), siteName, siteDescription, adminEmail, maintenanceMode,
         allowRegistration, emailNotifications, backupFrequency, timezone, language)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'System settings saved successfully',
      data
    })
  } catch (error) {
    console.error('Error saving system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save system settings' },
      { status: 500 }
    )
  }
}