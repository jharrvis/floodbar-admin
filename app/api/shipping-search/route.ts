import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    console.log('Shipping search query:', query)

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 3 characters'
      })
    }

    // First check if table exists
    try {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM shipping_rates LIMIT 1`)
    } catch (tableError) {
      console.error('Shipping rates table does not exist:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Shipping rates table not found'
      }, { status: 404 })
    }

    // Search cities in shipping_rates table
    const cities = await prisma.$queryRawUnsafe(`
      SELECT tujuan as city, harga_per_kg as price_per_kg, estimasi_hari
      FROM shipping_rates 
      WHERE tujuan LIKE CONCAT('%', ?, '%') AND aktif = 1
      ORDER BY tujuan ASC
      LIMIT 10
    `, query)

    console.log('Found cities:', cities)

    return NextResponse.json({
      success: true,
      cities
    })

  } catch (error) {
    console.error('Error searching cities:', error)
    return NextResponse.json(
      { success: false, error: `Database error: ${error.message}` },
      { status: 500 }
    )
  }
}