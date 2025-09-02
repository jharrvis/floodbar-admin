import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-callback-token')

    // Get payment settings to verify webhook
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (!settingsResult.length || !settingsResult[0].isXenditEnabled) {
      return NextResponse.json(
        { success: false, error: 'Xendit not configured' },
        { status: 400 }
      )
    }

    const settings = settingsResult[0]

    // Verify webhook signature
    if (signature !== settings.xenditWebhookToken) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const webhookData = JSON.parse(body)
    
    // Handle invoice payment events
    if (webhookData.external_id && webhookData.external_id.startsWith('floodbar-')) {
      const orderId = webhookData.external_id.replace('floodbar-', '')
      
      let paymentStatus = 'pending'
      let orderStatus = 'pending'

      switch (webhookData.status) {
        case 'PAID':
          paymentStatus = 'paid'
          orderStatus = 'processing'
          break
        case 'EXPIRED':
        case 'FAILED':
          paymentStatus = 'failed'
          orderStatus = 'cancelled'
          break
        default:
          paymentStatus = 'pending'
          orderStatus = 'pending'
      }

      // Update order status
      await prisma.$executeRawUnsafe(`
        UPDATE orders 
        SET paymentStatus = ?, status = ?, paidAt = ?
        WHERE id = ?
      `, paymentStatus, orderStatus, webhookData.status === 'PAID' ? new Date() : null, orderId)

      console.log(`Order ${orderId} payment status updated to: ${paymentStatus}`)

      // If payment is successful, send confirmation notifications
      if (webhookData.status === 'PAID') {
        try {
          // Get order details
          const orderResult = await prisma.$queryRawUnsafe(`
            SELECT * FROM orders WHERE id = ?
          `, orderId) as any[]

          if (orderResult.length > 0) {
            const order = orderResult[0]

            // Send confirmation email
            await fetch(`${process.env.NEXTAUTH_URL || 'https://floodbar.id'}/api/notifications/email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: order.customerEmail,
                orderId,
                orderData: {
                  customer: {
                    name: order.customerName,
                    email: order.customerEmail,
                    phone: order.customerPhone,
                    address: order.customerAddress,
                    city: order.customerCity,
                    postalCode: order.customerPostalCode
                  },
                  productConfig: {
                    width: order.productWidth,
                    height: order.productHeight,
                    thickness: order.productThickness,
                    quantity: order.productQuantity,
                    finish: order.productFinish
                  },
                  shipping: {
                    origin: order.shippingOrigin,
                    destination: order.shippingDestination,
                    weight: order.shippingWeight,
                    service: order.shippingService,
                    cost: order.shippingCost
                  },
                  payment: {
                    method: order.paymentMethod,
                    provider: order.paymentProvider
                  },
                  orderSummary: {
                    subtotal: order.subtotal,
                    shippingCost: order.shippingCost,
                    adminFee: order.adminFee,
                    grandTotal: order.grandTotal
                  }
                },
                subject: 'Payment Confirmed - Order Processing'
              })
            })

            // Send WhatsApp notification
            await fetch(`${process.env.NEXTAUTH_URL || 'https://floodbar.id'}/api/notifications/whatsapp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: order.customerPhone,
                orderId,
                orderData: {
                  customer: {
                    name: order.customerName,
                    email: order.customerEmail,
                    phone: order.customerPhone,
                    address: order.customerAddress,
                    city: order.customerCity,
                    postalCode: order.customerPostalCode
                  },
                  productConfig: {
                    width: order.productWidth,
                    height: order.productHeight,
                    thickness: order.productThickness,
                    quantity: order.productQuantity,
                    finish: order.productFinish
                  },
                  shipping: {
                    origin: order.shippingOrigin,
                    destination: order.shippingDestination,
                    weight: order.shippingWeight,
                    service: order.shippingService,
                    cost: order.shippingCost
                  },
                  payment: {
                    method: order.paymentMethod,
                    provider: order.paymentProvider
                  },
                  orderSummary: {
                    subtotal: order.subtotal,
                    shippingCost: order.shippingCost,
                    adminFee: order.adminFee,
                    grandTotal: order.grandTotal
                  }
                },
                subject: 'Payment Confirmed'
              })
            })
          }
        } catch (notificationError) {
          console.error('Error sending confirmation notifications:', notificationError)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}