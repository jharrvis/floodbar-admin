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
    adminFee: number
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
      orderData.orderSummary.adminFee,
      orderData.orderSummary.grandTotal,
      'pending'
    )

    // Send email notification
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/email`, {
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
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/whatsapp`, {
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

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order berhasil dibuat'
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