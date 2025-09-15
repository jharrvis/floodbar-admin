import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Set default date range (last 12 months if not specified)
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1)

    const start = startDate ? new Date(startDate) : defaultStartDate
    const end = endDate ? new Date(endDate) : defaultEndDate

    // Fetch ALL orders within date range (sama seperti halaman /admin/orders)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
        // Tidak ada filter status - tampilkan semua orders seperti halaman kelola pesanan
      },
      select: {
        createdAt: true,
        grandTotal: true,
        productQuantity: true  // Tambahkan quantity untuk grafik
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group orders by month
    const salesByMonth = orders.reduce((acc: { [key: string]: { sales: number, orders: number, quantity: number } }, order) => {
      const date = new Date(order.createdAt)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthYear]) {
        acc[monthYear] = { sales: 0, orders: 0, quantity: 0 }
      }
      
      acc[monthYear].sales += Number(order.grandTotal)
      acc[monthYear].orders += 1
      acc[monthYear].quantity += Number(order.productQuantity) // Tambahkan quantity
      
      return acc
    }, {})

    // Generate complete month range (fill missing months with 0)
    const result = []
    const currentDate = new Date(start)
    
    while (currentDate <= end) {
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const monthName = currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      
      result.push({
        month: monthName,
        monthYear: monthYear,
        sales: salesByMonth[monthYear]?.sales || 0,
        orders: salesByMonth[monthYear]?.orders || 0,
        quantity: salesByMonth[monthYear]?.quantity || 0  // Include quantity in result
      })
      
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return NextResponse.json({
      success: true,
      data: result,
      summary: {
        totalSales: result.reduce((sum, item) => sum + item.sales, 0),
        totalOrders: result.reduce((sum, item) => sum + item.orders, 0),
        totalQuantity: result.reduce((sum, item) => sum + item.quantity, 0),
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error fetching sales chart data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}