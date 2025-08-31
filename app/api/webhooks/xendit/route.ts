import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Xendit webhook received')
    
    const body = await request.text()
    const webhookData = JSON.parse(body)
    
    console.log('📦 Webhook data:', {
      id: webhookData.id,
      external_id: webhookData.external_id,
      status: webhookData.status,
      amount: webhookData.amount
    })

    // Get webhook token from database for verification
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT xenditWebhookToken FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length === 0 || !settingsResult[0].xenditWebhookToken) {
      console.error('❌ Webhook token not configured')
      return NextResponse.json(
        { success: false, error: 'Webhook token not configured' },
        { status: 500 }
      )
    }

    const webhookToken = settingsResult[0].xenditWebhookToken

    // Verify webhook signature
    const xCallbackToken = request.headers.get('x-callback-token')
    if (xCallbackToken !== webhookToken) {
      console.error('❌ Invalid webhook token')
      return NextResponse.json(
        { success: false, error: 'Invalid webhook token' },
        { status: 401 }
      )
    }

    // Extract order ID from external_id
    const externalId = webhookData.external_id
    let orderId = null

    if (externalId?.startsWith('floodbar-')) {
      // Handle both normal and retry format
      // Normal: floodbar-FLB-123456789
      // Retry: floodbar-FLB-123456789-retry-timestamp
      const parts = externalId.split('-')
      if (parts.length >= 3) {
        orderId = `${parts[1]}-${parts[2]}` // FLB-123456789
      }
    }

    if (!orderId) {
      console.error('❌ Cannot extract order ID from external_id:', externalId)
      return NextResponse.json(
        { success: false, error: 'Invalid external_id format' },
        { status: 400 }
      )
    }

    console.log('🔍 Processing order ID:', orderId)

    // Check if order exists
    const orderResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM orders WHERE id = ?
    `, orderId) as any[]

    if (orderResult.length === 0) {
      console.error('❌ Order not found:', orderId)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult[0]
    let newStatus = order.status
    let shouldUpdateStatus = false

    // Map Xendit invoice status to our order status
    switch (webhookData.status) {
      case 'PAID':
        if (order.status === 'pending') {
          newStatus = 'paid'
          shouldUpdateStatus = true
          console.log('✅ Payment successful for order:', orderId)
        }
        break
      
      case 'SETTLED':
        if (order.status === 'paid') {
          newStatus = 'processing'
          shouldUpdateStatus = true
          console.log('📦 Payment settled, order processing:', orderId)
        }
        break
      
      case 'EXPIRED':
        if (order.status === 'pending') {
          newStatus = 'expired'
          shouldUpdateStatus = true
          console.log('⏰ Payment expired for order:', orderId)
        }
        break
      
      default:
        console.log('ℹ️ Unhandled webhook status:', webhookData.status)
        break
    }

    // Update order status if needed
    if (shouldUpdateStatus) {
      await prisma.$executeRawUnsafe(`
        UPDATE orders 
        SET status = ?, updatedAt = NOW()
        WHERE id = ?
      `, newStatus, orderId)

      console.log(`🔄 Order ${orderId} status updated: ${order.status} -> ${newStatus}`)

      // Log webhook event for debugging
      await prisma.$executeRawUnsafe(`
        INSERT INTO webhook_logs (
          id, orderId, provider, eventType, status, webhookData, processedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, 
        'webhook-' + Date.now(),
        orderId,
        'xendit',
        'invoice_status',
        newStatus,
        JSON.stringify(webhookData)
      )

      // Send notification email for successful payment
      if (newStatus === 'paid') {
        try {
          // Only send in production to avoid spam during development
          if (process.env.NODE_ENV === 'production') {
            await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/email-paid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId,
                customerEmail: order.customerEmail,
                amount: webhookData.amount
              })
            })
          }
          
          console.log('📧 Payment confirmation email triggered for:', order.customerEmail)
        } catch (emailError) {
          console.error('❌ Failed to send payment confirmation email:', emailError)
        }
      }
    } else {
      console.log('ℹ️ No status update needed for order:', orderId, `(current: ${order.status}, webhook: ${webhookData.status})`)
    }

    // Return success response to Xendit
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      order_id: orderId,
      status_updated: shouldUpdateStatus,
      new_status: shouldUpdateStatus ? newStatus : order.status
    })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    
    // Still return 200 to prevent Xendit from retrying
    // but log the error for debugging
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'Xendit webhook endpoint',
    status: 'active'
  })
}