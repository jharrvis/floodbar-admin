import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

async function ensureGmailColumns() {
  // Only try to add columns in development or if explicitly needed
  if (process.env.NODE_ENV === 'production') {
    return // Skip column creation in production
  }
  
  const alterQueries = [
    `ALTER TABLE payment_settings ADD COLUMN gmailUser VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE payment_settings ADD COLUMN gmailAppPassword VARCHAR(255) DEFAULT ''`, 
    `ALTER TABLE payment_settings ADD COLUMN isEmailEnabled BOOLEAN DEFAULT false`,
    `ALTER TABLE payment_settings ADD COLUMN emailFrom VARCHAR(255) DEFAULT 'FloodBar'`
  ]
  
  for (const query of alterQueries) {
    try {
      await prisma.$executeRawUnsafe(query)
    } catch (error) {
      // Ignore all errors in column creation - this is just a helper function
    }
  }
}

interface PaymentSettings {
  id: string | null
  xenditApiKey: string
  xenditWebhookToken: string
  xenditPublicKey: string
  isXenditEnabled: boolean
  supportedMethods: string[]
  minimumAmount: number
  maximumAmount: number
  adminFee: number
  adminFeeType: 'fixed' | 'percentage'
  successRedirectUrl: string
  failureRedirectUrl: string
  environment: 'sandbox' | 'production'
  // Email SMTP Settings
  gmailUser: string
  gmailAppPassword: string
  isEmailEnabled: boolean
  emailFrom: string
}

export async function GET() {
  try {
    // Try to ensure Gmail columns exist (only in development)
    await ensureGmailColumns()
    
    // Try to get all settings first, fall back to basic settings if Gmail columns don't exist
    let settingsResult
    try {
      settingsResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]
    } catch (error) {
      // Fall back to basic fields only if Gmail columns don't exist
      settingsResult = await prisma.$queryRawUnsafe(`
        SELECT id, xenditApiKey, xenditWebhookToken, xenditPublicKey, isXenditEnabled, 
               supportedMethodsJson, minimumAmount, maximumAmount, adminFee, adminFeeType,
               successRedirectUrl, failureRedirectUrl, environment, createdAt, updatedAt
        FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]
    }

    const settings = settingsResult.length > 0 ? settingsResult[0] : null

    if (!settings) {
      // Return default settings if none exists
      const defaultSettings: PaymentSettings = {
        id: null,
        xenditApiKey: '',
        xenditWebhookToken: '',
        xenditPublicKey: '',
        isXenditEnabled: false,
        supportedMethods: ['credit_card', 'bank_transfer', 'ewallet', 'qris'],
        minimumAmount: 10000,
        maximumAmount: 50000000,
        adminFee: 5000,
        adminFeeType: 'fixed',
        successRedirectUrl: '/payment/success',
        failureRedirectUrl: '/payment/failure',
        environment: 'sandbox',
        // Email SMTP defaults
        gmailUser: '',
        gmailAppPassword: '',
        isEmailEnabled: false,
        emailFrom: 'FloodBar'
      }
      return NextResponse.json(defaultSettings)
    }

    const formattedSettings: PaymentSettings = {
      id: settings.id,
      xenditApiKey: settings.xenditApiKey || '',
      xenditWebhookToken: settings.xenditWebhookToken || '',
      xenditPublicKey: settings.xenditPublicKey || '',
      isXenditEnabled: Boolean(settings.isXenditEnabled),
      supportedMethods: JSON.parse(settings.supportedMethodsJson || '["credit_card","bank_transfer","ewallet","qris"]'),
      minimumAmount: Number(settings.minimumAmount) || 10000,
      maximumAmount: Number(settings.maximumAmount) || 50000000,
      adminFee: Number(settings.adminFee) || 5000,
      adminFeeType: settings.adminFeeType || 'fixed',
      successRedirectUrl: settings.successRedirectUrl || '/payment/success',
      failureRedirectUrl: settings.failureRedirectUrl || '/payment/failure',
      environment: settings.environment || 'sandbox',
      // Email SMTP Settings
      gmailUser: settings.gmailUser || '',
      gmailAppPassword: settings.gmailAppPassword || '',
      isEmailEnabled: Boolean(settings.isEmailEnabled),
      emailFrom: settings.emailFrom || 'FloodBar'
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Try to ensure Gmail columns exist (only in development)
    await ensureGmailColumns()
    
    const data: PaymentSettings = await request.json()

    // Validate required fields
    if (data.isXenditEnabled && (!data.xenditApiKey || !data.xenditWebhookToken)) {
      return NextResponse.json(
        { success: false, error: 'API Key dan Webhook Token wajib diisi jika Xendit diaktifkan' },
        { status: 400 }
      )
    }

    // Check if settings exists
    const existingSettingsResult = await prisma.$queryRawUnsafe(`
      SELECT id FROM payment_settings LIMIT 1
    `) as any[]

    const settingsData = {
      xenditApiKey: data.xenditApiKey || '',
      xenditWebhookToken: data.xenditWebhookToken || '',
      xenditPublicKey: data.xenditPublicKey || '',
      isXenditEnabled: data.isXenditEnabled,
      supportedMethodsJson: JSON.stringify(data.supportedMethods),
      minimumAmount: data.minimumAmount || 10000,
      maximumAmount: data.maximumAmount || 50000000,
      adminFee: data.adminFee || 5000,
      adminFeeType: data.adminFeeType || 'fixed',
      successRedirectUrl: data.successRedirectUrl || '/payment/success',
      failureRedirectUrl: data.failureRedirectUrl || '/payment/failure',
      environment: data.environment || 'sandbox',
      // Email SMTP Settings
      gmailUser: data.gmailUser || '',
      gmailAppPassword: data.gmailAppPassword || '',
      isEmailEnabled: data.isEmailEnabled || false,
      emailFrom: data.emailFrom || 'FloodBar'
    }

    if (existingSettingsResult && existingSettingsResult.length > 0) {
      // Update existing settings (skip Gmail fields if columns don't exist)
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE payment_settings 
          SET xenditApiKey = ?, xenditWebhookToken = ?, xenditPublicKey = ?,
              isXenditEnabled = ?, supportedMethodsJson = ?, minimumAmount = ?,
              maximumAmount = ?, adminFee = ?, adminFeeType = ?,
              successRedirectUrl = ?, failureRedirectUrl = ?, environment = ?,
              gmailUser = ?, gmailAppPassword = ?, isEmailEnabled = ?, emailFrom = ?,
              updatedAt = NOW()
          WHERE id = ?
        `,
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount, settingsData.adminFee, settingsData.adminFeeType,
          settingsData.successRedirectUrl, settingsData.failureRedirectUrl, settingsData.environment,
          settingsData.gmailUser, settingsData.gmailAppPassword, settingsData.isEmailEnabled, settingsData.emailFrom,
          existingSettingsResult[0].id
        )
      } catch (dbError) {
        console.log('Database update failed (columns may not exist), updating basic fields only:', dbError instanceof Error ? dbError.message : dbError)
        // Fallback to basic fields only
        await prisma.$executeRawUnsafe(`
          UPDATE payment_settings 
          SET xenditApiKey = ?, xenditWebhookToken = ?, xenditPublicKey = ?,
              isXenditEnabled = ?, supportedMethodsJson = ?, minimumAmount = ?,
              maximumAmount = ?, adminFee = ?, adminFeeType = ?,
              successRedirectUrl = ?, failureRedirectUrl = ?, environment = ?,
              updatedAt = NOW()
          WHERE id = ?
        `,
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount, settingsData.adminFee, settingsData.adminFeeType,
          settingsData.successRedirectUrl, settingsData.failureRedirectUrl, settingsData.environment,
          existingSettingsResult[0].id
        )
      }
    } else {
      // Create new settings (skip Gmail fields if columns don't exist)
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO payment_settings (
            id, xenditApiKey, xenditWebhookToken, xenditPublicKey,
            isXenditEnabled, supportedMethodsJson, minimumAmount, maximumAmount,
            adminFee, adminFeeType, successRedirectUrl, failureRedirectUrl, environment,
            gmailUser, gmailAppPassword, isEmailEnabled, emailFrom
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          'payment-' + Date.now(),
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount, settingsData.adminFee, settingsData.adminFeeType,
          settingsData.successRedirectUrl, settingsData.failureRedirectUrl, settingsData.environment,
          settingsData.gmailUser, settingsData.gmailAppPassword, settingsData.isEmailEnabled, settingsData.emailFrom
        )
      } catch (dbError) {
        console.log('Database insert failed (columns may not exist), inserting basic fields only:', dbError instanceof Error ? dbError.message : dbError)
        // Fallback to basic fields only
        await prisma.$executeRawUnsafe(`
          INSERT INTO payment_settings (
            id, xenditApiKey, xenditWebhookToken, xenditPublicKey,
            isXenditEnabled, supportedMethodsJson, minimumAmount, maximumAmount,
            adminFee, adminFeeType, successRedirectUrl, failureRedirectUrl, environment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          'payment-' + Date.now(),
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount, settingsData.adminFee, settingsData.adminFeeType,
          settingsData.successRedirectUrl, settingsData.failureRedirectUrl, settingsData.environment
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        ...settingsData
      }
    })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}