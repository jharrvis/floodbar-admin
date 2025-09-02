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

    console.log('🔄 Syncing payment status for order:', orderId)

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

    // Get payment settings
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length === 0 || !settingsResult[0].isXenditEnabled || !settingsResult[0].xenditApiKey) {
      return NextResponse.json(
        { success: false, error: 'Xendit not configured' },
        { status: 500 }
      )
    }

    const settings = settingsResult[0]

    // Try to find Xendit invoice for this order
    // Check both normal and retry formats
    const possibleExternalIds = [
      `floodbar-${orderId}`,
      `floodbar-${orderId}-retry`
    ]

    let xenditInvoice = null
    
    for (const externalId of possibleExternalIds) {
      try {
        console.log('🔍 Checking Xendit invoice with external_id:', externalId)
        
        const xenditResponse = await fetch(`https://api.xendit.co/v2/invoices?external_id=${externalId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(settings.xenditApiKey + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        })

        if (xenditResponse.ok) {
          const invoices = await xenditResponse.json()
          if (invoices && invoices.length > 0) {
            // Get the most recent invoice
            xenditInvoice = invoices[invoices.length - 1]
            console.log('✅ Found Xendit invoice:', xenditInvoice.id, 'Status:', xenditInvoice.status)
            break
          }
        }
      } catch (error) {
        console.log(`❌ Error checking external_id ${externalId}:`, error)
        continue
      }
    }

    if (!xenditInvoice) {
      console.log('ℹ️ No Xendit invoice found for order:', orderId)
      return NextResponse.json({
        success: true,
        message: 'No Xendit invoice found',
        currentStatus: order.status,
        synced: false
      })
    }

    // Map Xendit status to our order status
    let newStatus = order.status
    let newPaymentStatus = order.paymentStatus
    let shouldUpdate = false

    switch (xenditInvoice.status) {
      case 'PAID':
        if (order.paymentStatus !== 'paid') {
          newPaymentStatus = 'paid'
          shouldUpdate = true
        }
        if (order.status === 'pending') {
          newStatus = 'processing' // Move to processing when paid
          shouldUpdate = true
        }
        break
      case 'SETTLED':
        if (order.paymentStatus !== 'paid') {
          newPaymentStatus = 'paid'
          shouldUpdate = true
        }
        if (order.status === 'pending') {
          newStatus = 'processing'
          shouldUpdate = true
        }
        break
      case 'EXPIRED':
        if (order.paymentStatus === 'pending') {
          newPaymentStatus = 'failed'
          shouldUpdate = true
        }
        if (order.status === 'pending') {
          newStatus = 'cancelled'
          shouldUpdate = true
        }
        break
    }

    if (shouldUpdate) {
      // Update order status and payment status
      await prisma.$executeRawUnsafe(`
        UPDATE orders 
        SET status = ?, paymentStatus = ?, updatedAt = NOW()
        WHERE id = ?
      `, newStatus, newPaymentStatus, orderId)

      console.log(`✅ Order ${orderId} status synced: ${order.status} -> ${newStatus}, payment: ${order.paymentStatus} -> ${newPaymentStatus}`)

      // Log sync event
      await prisma.$executeRawUnsafe(`
        INSERT INTO webhook_logs (
          id, orderId, provider, eventType, status, webhookData, processedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, 
        'sync-' + Date.now(),
        orderId,
        'xendit',
        'manual_sync',
        newStatus,
        JSON.stringify({
          invoice_id: xenditInvoice.id,
          invoice_status: xenditInvoice.status,
          amount: xenditInvoice.amount,
          external_id: xenditInvoice.external_id,
          previous_payment_status: order.paymentStatus,
          new_payment_status: newPaymentStatus
        })
      )

      return NextResponse.json({
        success: true,
        message: 'Order status synced successfully',
        previousStatus: order.status,
        currentStatus: newStatus,
        previousPaymentStatus: order.paymentStatus,
        currentPaymentStatus: newPaymentStatus,
        xenditStatus: xenditInvoice.status,
        synced: true
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Order status already up to date',
        currentStatus: order.status,
        xenditStatus: xenditInvoice.status,
        synced: false
      })
    }

  } catch (error) {
    console.error('❌ Error syncing order status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}