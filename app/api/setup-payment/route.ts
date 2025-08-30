import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create payment_settings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id VARCHAR(255) PRIMARY KEY,
        xenditApiKey TEXT,
        xenditWebhookToken TEXT,
        xenditPublicKey TEXT,
        isXenditEnabled BOOLEAN DEFAULT FALSE,
        supportedMethodsJson JSON,
        minimumAmount DECIMAL(15,2) DEFAULT 10000,
        maximumAmount DECIMAL(15,2) DEFAULT 50000000,
        adminFee DECIMAL(15,2) DEFAULT 5000,
        adminFeeType ENUM('fixed', 'percentage') DEFAULT 'fixed',
        successRedirectUrl VARCHAR(500) DEFAULT '/payment/success',
        failureRedirectUrl VARCHAR(500) DEFAULT '/payment/failure',
        environment ENUM('sandbox', 'production') DEFAULT 'sandbox',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Payment settings table created successfully' 
    })
  } catch (error) {
    console.error('Error setting up payment settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup payment settings table' },
      { status: 500 }
    )
  }
}