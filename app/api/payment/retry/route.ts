import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order data
    const orderResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM orders WHERE id = ?
    `, orderId) as any[]

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult[0]

    // Check if order is still pending (not paid yet)
    if (order.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Order is not in pending status' },
        { status: 400 }
      )
    }

    // Get payment settings
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length === 0 || !settingsResult[0].isXenditEnabled || !settingsResult[0].xenditApiKey) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const settings = settingsResult[0]
    const xenditUrl = settings.environment === 'sandbox' 
      ? 'https://api.xendit.co/v2/invoices' 
      : 'https://api.xendit.co/v2/invoices'

    // Create new Xendit invoice with retry suffix
    const xenditInvoiceData = {
      external_id: `floodbar-${orderId}-retry-${Date.now()}`,
      amount: order.grandTotal,
      description: `FloodBar Order ${orderId} (Retry)`,
      invoice_duration: 86400, // 24 hours
      customer: {
        given_names: order.customerName,
        email: order.customerEmail,
        mobile_number: order.customerPhone
      },
      customer_notification_preference: {
        invoice_created: ['email'],
        invoice_reminder: ['email'],
        invoice_paid: ['email']
      },
      success_redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${settings.successRedirectUrl}`,
      failure_redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${settings.failureRedirectUrl}`,
      currency: 'IDR',
      items: [
        {
          name: 'FloodBar Custom Product (Retry)',
          quantity: 1,
          price: order.grandTotal,
          category: 'Building Materials'
        }
      ]
    }

    // Call Xendit API
    console.log('Creating retry Xendit invoice for order:', orderId)
    const xenditResponse = await fetch(xenditUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(settings.xenditApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xenditInvoiceData)
    })

    const xenditResult = await xenditResponse.json()
    console.log('Xendit retry response:', xenditResponse.status, xenditResult)

    if (xenditResponse.ok && xenditResult.invoice_url) {
      return NextResponse.json({
        success: true,
        paymentUrl: xenditResult.invoice_url,
        message: 'Payment link created successfully'
      })
    } else {
      console.error('Failed to create retry Xendit invoice:', xenditResult)
      
      if (xenditResult.error_code === 'UNAUTHORIZED_SENDER_IP') {
        return NextResponse.json(
          { success: false, error: 'IP allowlist error. Please contact administrator.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create payment link' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error creating retry payment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}