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

    // Get payment settings
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (!settingsResult.length || !settingsResult[0].isXenditEnabled) {
      return NextResponse.json(
        { success: false, error: 'Xendit payment gateway is not enabled' },
        { status: 400 }
      )
    }

    const settings = settingsResult[0]
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

    // Create invoice with Xendit
    const xenditResponse = await fetch(xenditUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(settings.xenditApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xenditInvoiceData)
    })

    const xenditResult = await xenditResponse.json()

    if (!xenditResponse.ok) {
      console.error('Xendit error:', xenditResult)
      return NextResponse.json(
        { success: false, error: 'Failed to create payment invoice' },
        { status: 400 }
      )
    }

    // Store invoice info in database
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET xenditInvoiceId = ?, xenditInvoiceUrl = ?, paymentStatus = 'pending'
      WHERE id = ?
    `, xenditResult.id, xenditResult.invoice_url, invoiceData.orderId)

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