import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 3 characters'
      })
    }

    // Search cities in shipping_rates table
    const cities = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT tujuan as city, harga_per_kg as price_per_kg
      FROM shipping_rates 
      WHERE tujuan LIKE ? 
      ORDER BY tujuan ASC
      LIMIT 10
    `, `%${query}%`)

    return NextResponse.json({
      success: true,
      cities
    })

  } catch (error) {
    console.error('Error searching cities:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}