import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Removed ensureGmailColumns function - just use defaults for Gmail fields

interface PaymentSettings {
  id: string | null
  xenditApiKey: string
  xenditWebhookToken: string
  xenditPublicKey: string
  isXenditEnabled: boolean
  supportedMethods: string[]
  minimumAmount: number
  maximumAmount: number
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
    // Try to get all settings including Gmail fields, fallback to basic if Gmail columns don't exist
    let settingsResult
    try {
      settingsResult = await prisma.$queryRawUnsafe(`
        SELECT id, xenditApiKey, xenditWebhookToken, xenditPublicKey, isXenditEnabled, 
               supportedMethodsJson, minimumAmount, maximumAmount,
               successRedirectUrl, failureRedirectUrl, environment, createdAt, updatedAt,
               gmailUser, gmailAppPassword, isEmailEnabled, emailFrom
        FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]
    } catch (error) {
      // Fallback to basic fields if Gmail columns don't exist
      console.log('Gmail columns not available, using basic query:', error instanceof Error ? error.message : error)
      settingsResult = await prisma.$queryRawUnsafe(`
        SELECT id, xenditApiKey, xenditWebhookToken, xenditPublicKey, isXenditEnabled, 
               supportedMethodsJson, minimumAmount, maximumAmount,
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
      successRedirectUrl: settings.successRedirectUrl || '/payment/success',
      failureRedirectUrl: settings.failureRedirectUrl || '/payment/failure',
      environment: settings.environment || 'sandbox',
      // Email SMTP Settings - Use defaults if columns don't exist
      gmailUser: settings.gmailUser || '',
      gmailAppPassword: settings.gmailAppPassword || '',
      isEmailEnabled: Boolean(settings.isEmailEnabled || false),
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
              maximumAmount = ?,
              successRedirectUrl = ?, failureRedirectUrl = ?, environment = ?,
              gmailUser = ?, gmailAppPassword = ?, isEmailEnabled = ?, emailFrom = ?,
              updatedAt = NOW()
          WHERE id = ?
        `,
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount,
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
              maximumAmount = ?,
              successRedirectUrl = ?, failureRedirectUrl = ?, environment = ?,
              updatedAt = NOW()
          WHERE id = ?
        `,
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount,
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
            successRedirectUrl, failureRedirectUrl, environment,
            gmailUser, gmailAppPassword, isEmailEnabled, emailFrom
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          'payment-' + Date.now(),
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount,
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
            successRedirectUrl, failureRedirectUrl, environment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          'payment-' + Date.now(),
          settingsData.xenditApiKey, settingsData.xenditWebhookToken, settingsData.xenditPublicKey,
          settingsData.isXenditEnabled, settingsData.supportedMethodsJson, settingsData.minimumAmount,
          settingsData.maximumAmount,
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