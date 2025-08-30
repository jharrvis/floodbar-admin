import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await request.json()
    const { orderId } = params

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET status = ?, updatedAt = NOW()
      WHERE id = ?
    `, status, orderId)

    // Get updated order details for notifications
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

    // Send status update notifications
    if (status === 'shipped') {
      try {
        // Send email notification
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/email`, {
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
            subject: 'Order Shipped - Tracking Information'
          })
        })

        // Send WhatsApp notification
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/whatsapp`, {
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
            subject: 'Order Shipped'
          })
        })
      } catch (notificationError) {
        console.error('Error sending status update notifications:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}