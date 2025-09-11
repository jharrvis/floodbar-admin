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

    // Find order by id (which contains the orderId)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return order with actual schema fields only
    const orderData = {
      orderId: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentStatus: order.paymentStatus,
      productConfig: {
        model: 'Custom', // No productModel field in current schema
        width: order.productWidth,
        height: order.productHeight,
        quantity: order.productQuantity
      },
      shipping: {
        destination: order.shippingDestination,
        weight: order.shippingWeight,
        cost: order.shippingCost
      },
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        city: order.customerCity
      },
      orderSummary: {
        grandTotal: order.grandTotal
      },
      paymentMethod: order.paymentMethod,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerCity: order.customerCity,
      xenditInvoiceUrl: order.xenditInvoiceUrl
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