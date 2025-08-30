import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface InvoiceData {
  amount: number
  description: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export async function POST(request: NextRequest) {
  try {
    const invoiceData: InvoiceData = await request.json()

    // Get payment settings from database
    let settings
    try {
      const settingsResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]

      if (!settingsResult.length) {
        return NextResponse.json(
          { success: false, error: 'Payment settings not configured in admin panel' },
          { status: 400 }
        )
      }

      settings = settingsResult[0]
      
      if (!settings.isXenditEnabled) {
        return NextResponse.json(
          { success: false, error: 'Xendit payment gateway is not enabled in admin panel' },
          { status: 400 }
        )
      }

      if (!settings.xenditApiKey) {
        return NextResponse.json(
          { success: false, error: 'Xendit API Key not configured in admin panel' },
          { status: 400 }
        )
      }

    } catch (dbError) {
      console.error('Database error loading payment settings:', dbError)
      return NextResponse.json(
        { success: false, error: 'Could not load payment settings from database' },
        { status: 500 }
      )
    }
    const xenditUrl = settings.environment === 'sandbox' 
      ? 'https://api.xendit.co/v2/invoices' 
      : 'https://api.xendit.co/v2/invoices'

    // Prepare invoice data for Xendit
    const xenditInvoiceData = {
      external_id: `floodbar-${invoiceData.orderId}`,
      amount: invoiceData.amount,
      description: invoiceData.description,
      invoice_duration: 86400, // 24 hours
      customer: {
        given_names: invoiceData.customerName,
        email: invoiceData.customerEmail,
        mobile_number: invoiceData.customerPhone
      },
      customer_notification_preference: {
        invoice_created: ['email', 'sms'],
        invoice_reminder: ['email', 'sms'],
        invoice_paid: ['email', 'sms']
      },
      success_redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${settings.successRedirectUrl}`,
      failure_redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${settings.failureRedirectUrl}`,
      currency: 'IDR',
      items: [
        {
          name: 'FloodBar Custom Product',
          quantity: 1,
          price: invoiceData.amount,
          category: 'Building Materials'
        }
      ]
    }

    // Create invoice with real Xendit API
    console.log('Creating Xendit invoice with API key:', settings.xenditApiKey?.substring(0, 20) + '...')
    console.log('Environment:', settings.environment)
    console.log('Xendit URL:', xenditUrl)
    
    const xenditResponse = await fetch(xenditUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(settings.xenditApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xenditInvoiceData)
    })

    const xenditResult = await xenditResponse.json()
    console.log('Xendit response status:', xenditResponse.status)
    console.log('Xendit response data:', xenditResult)

    if (!xenditResponse.ok) {
      console.error('Xendit API error:', xenditResult)
      return NextResponse.json(
        { success: false, error: `Xendit API error: ${xenditResult.message || 'Unknown error'}`, xenditError: xenditResult },
        { status: xenditResponse.status }
      )
    }

    // Store invoice info in database (skip if columns don't exist yet)
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE orders 
        SET xenditInvoiceId = ?, xenditInvoiceUrl = ?, paymentStatus = 'pending'
        WHERE id = ?
      `, xenditResult.id, xenditResult.invoice_url, invoiceData.orderId)
    } catch (dbError) {
      console.log('Database update skipped (columns may not exist yet):', dbError instanceof Error ? dbError.message : dbError)
      // Continue without failing - this is not critical for testing
    }

    return NextResponse.json({
      success: true,
      invoiceUrl: xenditResult.invoice_url,
      invoiceId: xenditResult.id
    })

  } catch (error) {
    console.error('Error creating Xendit invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}