import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { orderId, trackingNumber } = await request.json()

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Order ID and tracking number are required' },
        { status: 400 }
      )
    }

    console.log('🚚 Updating order to shipped:', orderId, 'Tracking:', trackingNumber)

    // Get order data first
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

    // Update order status to shipped with tracking number
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET status = 'shipped', 
          trackingNumber = ?, 
          shippedAt = NOW(),
          updatedAt = NOW()
      WHERE id = ?
    `, trackingNumber, orderId)

    console.log(`✅ Order ${orderId} marked as shipped with tracking: ${trackingNumber}`)

    // Send notification email to customer
    try {
      // Use the correct base URL for different environments
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXTAUTH_URL || 'https://floodbar.id'
      
      console.log('📧 Calling shipped email API:', `${baseUrl}/api/notifications/shipped-email`)
      
      const emailResponse = await fetch(`${baseUrl}/api/notifications/shipped-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          trackingNumber,
          shippingService: order.shippingService
        })
      })

      const emailResult = await emailResponse.json()
      
      if (!emailResponse.ok) {
        console.error('❌ Failed to send shipped notification email:', emailResult)
      } else {
        console.log('📧 Shipped notification email sent successfully:', emailResult)
      }
    } catch (emailError) {
      console.error('❌ Error sending shipped notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order marked as shipped and customer notified',
      trackingNumber
    })

  } catch (error) {
    console.error('❌ Error updating order to shipped:', error)
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