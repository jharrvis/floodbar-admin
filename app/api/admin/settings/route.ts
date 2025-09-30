import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM settings ORDER BY createdAt DESC LIMIT 1
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
      language: 'id',
      logoUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      facebookUrl: '',
      facebookPixel: '',
      googleAnalytics: ''
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
      language,
      logoUrl,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
      facebookPixel,
      googleAnalytics
    } = data

    // Check if settings exist
    const existingSettingsResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM settings LIMIT 1
    `) as any[]

    if (existingSettingsResult && existingSettingsResult.length > 0) {
      // Update existing settings
      await prisma.$executeRawUnsafe(`
        UPDATE settings 
        SET siteName = ?, siteDescription = ?, adminEmail = ?, maintenanceMode = ?,
            allowRegistration = ?, emailNotifications = ?, backupFrequency = ?,
            timezone = ?, language = ?, logoUrl = ?, instagramUrl = ?, tiktokUrl = ?,
            facebookUrl = ?, facebookPixel = ?, googleAnalytics = ?, updatedAt = NOW()
        WHERE id = ?
      `, siteName, siteDescription, adminEmail, maintenanceMode,
         allowRegistration, emailNotifications, backupFrequency,
         timezone, language, logoUrl, instagramUrl, tiktokUrl,
         facebookUrl, facebookPixel, googleAnalytics, existingSettingsResult[0].id)
    } else {
      // Create new settings
      await prisma.$executeRawUnsafe(`
        INSERT INTO settings (
          id, siteName, siteDescription, adminEmail, maintenanceMode,
          allowRegistration, emailNotifications, backupFrequency,
          timezone, language, logoUrl, instagramUrl, tiktokUrl,
          facebookUrl, facebookPixel, googleAnalytics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 'settings-' + Date.now(), siteName, siteDescription, adminEmail, maintenanceMode,
         allowRegistration, emailNotifications, backupFrequency, timezone, language,
         logoUrl, instagramUrl, tiktokUrl, facebookUrl, facebookPixel, googleAnalytics)
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