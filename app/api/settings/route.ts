import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const settings = await prisma.$queryRawUnsafe(`
      SELECT * FROM settings ORDER BY createdAt DESC LIMIT 1
    `)

    if (Array.isArray(settings) && settings.length > 0) {
      const systemSettings = settings[0] as any
      
      const formattedSettings = {
        id: systemSettings.id,
        siteName: systemSettings.siteName,
        siteDescription: systemSettings.siteDescription,
        adminEmail: systemSettings.adminEmail,
        timezone: systemSettings.timezone,
        language: systemSettings.language,
        maintenanceMode: Boolean(systemSettings.maintenanceMode),
        allowRegistration: Boolean(systemSettings.allowRegistration),
        emailNotifications: Boolean(systemSettings.emailNotifications),
        backupFrequency: systemSettings.backupFrequency,
        createdAt: systemSettings.createdAt,
        updatedAt: systemSettings.updatedAt
      }
      
      return NextResponse.json(formattedSettings)
    } else {
      // Return default settings if none exists
      const defaultSettings = {
        id: null,
        siteName: 'Floodbar Admin Panel',
        siteDescription: 'Admin panel untuk mengelola halaman penjualan floodbar',
        adminEmail: 'admin@floodbar.com',
        timezone: 'Asia/Jakarta',
        language: 'id',
        maintenanceMode: false,
        allowRegistration: false,
        emailNotifications: true,
        backupFrequency: 'daily'
      }
      return NextResponse.json(defaultSettings)
    }
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.siteName || !data.adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Nama website dan email admin wajib diisi' },
        { status: 400 }
      )
    }

    // Check if settings exists
    const existingSettings = await prisma.$queryRawUnsafe(`
      SELECT id FROM settings LIMIT 1
    `) as any[]

    const settingsData = {
      siteName: data.siteName || 'Floodbar Admin Panel',
      siteDescription: data.siteDescription || '',
      adminEmail: data.adminEmail,
      timezone: data.timezone || 'Asia/Jakarta',
      language: data.language || 'id',
      maintenanceMode: Boolean(data.maintenanceMode),
      allowRegistration: Boolean(data.allowRegistration),
      emailNotifications: Boolean(data.emailNotifications),
      backupFrequency: data.backupFrequency || 'daily'
    }

    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      await prisma.$executeRawUnsafe(`
        UPDATE settings 
        SET siteName = ?, siteDescription = ?, adminEmail = ?, 
            timezone = ?, language = ?, maintenanceMode = ?, 
            allowRegistration = ?, emailNotifications = ?, backupFrequency = ?, 
            updatedAt = NOW()
        WHERE id = ?
      `, 
        settingsData.siteName, settingsData.siteDescription, settingsData.adminEmail,
        settingsData.timezone, settingsData.language, settingsData.maintenanceMode,
        settingsData.allowRegistration, settingsData.emailNotifications, settingsData.backupFrequency,
        existingSettings[0].id
      )
    } else {
      // Create new settings
      await prisma.$executeRawUnsafe(`
        INSERT INTO settings (
          id, siteName, siteDescription, adminEmail, timezone, language,
          maintenanceMode, allowRegistration, emailNotifications, backupFrequency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'settings-' + Date.now(),
        settingsData.siteName, settingsData.siteDescription, settingsData.adminEmail,
        settingsData.timezone, settingsData.language, settingsData.maintenanceMode,
        settingsData.allowRegistration, settingsData.emailNotifications, settingsData.backupFrequency
      )
    }

    return NextResponse.json({ success: true, data: settingsData })
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}