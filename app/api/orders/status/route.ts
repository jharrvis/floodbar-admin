import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Find order by orderId
    const order = await prisma.order.findFirst({
      where: {
        orderId: orderId
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const productConfig = order.productConfig ? JSON.parse(order.productConfig as string) : null
    const shipping = order.shipping ? JSON.parse(order.shipping as string) : null
    const customer = order.customer ? JSON.parse(order.customer as string) : null
    const orderSummary = order.orderSummary ? JSON.parse(order.orderSummary as string) : null

    // Return order with parsed data
    const orderData = {
      orderId: order.orderId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      processingAt: order.processingAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      productConfig,
      shipping,
      customer,
      orderSummary,
      paymentMethod: order.paymentMethod,
      customerName: customer?.name || '',
      customerEmail: customer?.email || '',
      customerCity: customer?.city || '',
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      courier: order.courier
    }

    return NextResponse.json({
      success: true,
      order: orderData
    })

  } catch (error) {
    console.error('Error fetching order status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}