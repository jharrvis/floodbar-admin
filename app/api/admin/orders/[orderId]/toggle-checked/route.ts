import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const { isChecked } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Update order checked status
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET isChecked = ?, updatedAt = NOW()
      WHERE id = ?
    `, isChecked, orderId)

    console.log(`✅ Order ${orderId} checked status updated to: ${isChecked}`)

    return NextResponse.json({
      success: true,
      message: 'Order checked status updated successfully',
      orderId,
      isChecked
    })

  } catch (error) {
    console.error('Error updating order checked status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update checked status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}