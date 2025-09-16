import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Find order by id (which contains the orderId) - use raw query to avoid schema issues
    const order = await prisma.$queryRaw`
      SELECT * FROM orders WHERE id = ${orderId} LIMIT 1
    `

    if (!order || !Array.isArray(order) || order.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderRecord = order[0] // Get first result from array
    
    // Return order with actual schema fields only
    const orderData = {
      orderId: orderRecord.id,
      status: orderRecord.status || 'pending',
      createdAt: orderRecord.createdAt,
      updatedAt: orderRecord.updatedAt,
      paymentStatus: orderRecord.paymentStatus || 'pending',
      productConfig: {
        model: orderRecord.productModel || 'Custom',
        width: orderRecord.productWidth,
        height: orderRecord.productHeight,
        quantity: orderRecord.productQuantity
      },
      shipping: {
        destination: orderRecord.shippingDestination,
        weight: orderRecord.shippingWeight,
        cost: orderRecord.shippingCost
      },
      customer: {
        name: orderRecord.customerName,
        email: orderRecord.customerEmail,
        city: orderRecord.customerCity
      },
      orderSummary: {
        grandTotal: orderRecord.grandTotal
      },
      paymentMethod: orderRecord.paymentMethod,
      customerName: orderRecord.customerName,
      customerEmail: orderRecord.customerEmail,
      customerCity: orderRecord.customerCity,
      trackingNumber: orderRecord.trackingNumber,
      shippedAt: orderRecord.shippedAt
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