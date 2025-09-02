import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface OrderData {
  productConfig: {
    width: number
    height: number
    thickness: number
    quantity: number
    finish: string
  }
  shipping: {
    origin: string
    destination: string
    weight: number
    service: string
    cost: number
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  payment: {
    method: string
    provider?: string
  }
  orderSummary: {
    subtotal: number
    shippingCost: number
    grandTotal: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json()

    // Validate required fields
    if (!orderData.customer.name || !orderData.customer.email || !orderData.customer.phone) {
      return NextResponse.json(
        { success: false, error: 'Data customer tidak lengkap' },
        { status: 400 }
      )
    }

    // Generate order ID
    const orderId = 'FLB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()

    // Save order to database
    await prisma.$executeRawUnsafe(`
      INSERT INTO orders (
        id, customerName, customerEmail, customerPhone, customerAddress, 
        customerCity, customerPostalCode, productWidth, productHeight, 
        productThickness, productQuantity, productFinish, shippingOrigin,
        shippingDestination, shippingWeight, shippingService, shippingCost,
        paymentMethod, paymentProvider, subtotal, adminFee, grandTotal,
        status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      orderId,
      orderData.customer.name,
      orderData.customer.email, 
      orderData.customer.phone,
      orderData.customer.address,
      orderData.customer.city,
      orderData.customer.postalCode,
      orderData.productConfig.width,
      orderData.productConfig.height,
      orderData.productConfig.thickness,
      orderData.productConfig.quantity,
      orderData.productConfig.finish,
      orderData.shipping.origin,
      orderData.shipping.destination,
      orderData.shipping.weight,
      orderData.shipping.service,
      orderData.shipping.cost,
      orderData.payment.method,
      orderData.payment.provider || '',
      orderData.orderSummary.subtotal,
      0, // adminFee
      orderData.orderSummary.grandTotal,
      'pending'
    )

    // Create Xendit payment invoice if payment method is xendit
    let paymentUrl = null
    console.log('Payment method:', orderData.payment.method)
    if (orderData.payment.method === 'xendit' || orderData.payment.method === 'online') {
      console.log('Creating Xendit invoice via API...')
      
      // Call Xendit create-invoice API directly (no more mocking)
      try {
        // Import the create-invoice logic directly instead of HTTP call to avoid ECONNREFUSED
        const { PrismaClient } = require('@prisma/client')
        const prismaLocal = new PrismaClient()
        
        // Get payment settings
        const settingsResult = await prismaLocal.$queryRawUnsafe(`
          SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
        `) as any[]
        
        if (settingsResult.length && settingsResult[0].isXenditEnabled && settingsResult[0].xenditApiKey) {
          const settings = settingsResult[0]
          const xenditUrl = settings.environment === 'sandbox' 
            ? 'https://api.xendit.co/v2/invoices' 
            : 'https://api.xendit.co/v2/invoices'

          // Prepare invoice data for Xendit
          const xenditInvoiceData = {
            external_id: `floodbar-${orderId}`,
            amount: orderData.orderSummary.grandTotal,
            description: `FloodBar Order ${orderId}`,
            invoice_duration: 86400, // 24 hours
            customer: {
              given_names: orderData.customer.name,
              email: orderData.customer.email,
              mobile_number: orderData.customer.phone
            },
            customer_notification_preference: {
              invoice_created: ['email'],
              invoice_reminder: ['email'],
              invoice_paid: ['email']
            },
            success_redirect_url: `${process.env.NEXTAUTH_URL || 'https://floodbar.id'}${settings.successRedirectUrl}`,
            failure_redirect_url: `${process.env.NEXTAUTH_URL || 'https://floodbar.id'}${settings.failureRedirectUrl}`,
            currency: 'IDR',
            items: [
              {
                name: 'FloodBar Custom Product',
                quantity: 1,
                price: orderData.orderSummary.grandTotal,
                category: 'Building Materials'
              }
            ]
          }

          // Create invoice with Xendit API
          console.log('Calling Xendit API with key:', settings.xenditApiKey?.substring(0, 20) + '...')
          const xenditResponse = await fetch(xenditUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(settings.xenditApiKey + ':').toString('base64')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(xenditInvoiceData)
          })

          const xenditResult = await xenditResponse.json()
          console.log('Xendit response:', xenditResponse.status, xenditResult)

          if (xenditResponse.ok && xenditResult.invoice_url) {
            paymentUrl = xenditResult.invoice_url
            console.log('✅ Payment URL from Xendit:', paymentUrl)
          } else {
            console.error('❌ Failed to create Xendit invoice:', {
              status: xenditResponse.status,
              response: xenditResult
            })
            
            // Check if it's an IP allowlist error
            if (xenditResult.error_code === 'UNAUTHORIZED_SENDER_IP') {
              console.error('🚨 IP ALLOWLIST ERROR: Server IP needs to be added to Xendit dashboard')
              console.error('📖 Instructions: Visit https://dashboard.xendit.co/settings/developers#ip-allowlist')
            }
          }
        } else {
          console.log('Xendit not enabled or API key not configured')
        }
        
        await prismaLocal.$disconnect()
      } catch (invoiceError) {
        console.error('Error creating Xendit invoice:', invoiceError)
      }
    }

    // Send email notification (skip for development to avoid ECONNREFUSED)
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: orderData.customer.email,
            orderId,
            orderData
          })
        })
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
      }

      // Send WhatsApp notification  
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: orderData.customer.phone,
            orderId,
            orderData
          })
        })
      } catch (whatsappError) {
        console.error('WhatsApp notification failed:', whatsappError)
      }
    } else {
      console.log('Development mode: Email and WhatsApp notifications skipped')
      console.log(`Email would be sent to: ${orderData.customer.email}`)
      console.log(`WhatsApp would be sent to: ${orderData.customer.phone}`)
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl,
      message: 'Order berhasil dibuat',
      paymentStatus: paymentUrl ? 'payment_url_created' : 'payment_url_failed'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (orderId) {
      // Get specific order
      const orderResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM orders WHERE id = ?
      `, orderId) as any[]

      if (orderResult.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order tidak ditemukan' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        order: orderResult[0]
      })
    } else {
      // Get all orders (for admin)
      const ordersResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM orders ORDER BY createdAt DESC LIMIT 50
      `) as any[]

      return NextResponse.json({
        success: true,
        orders: ordersResult
      })
    }

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}