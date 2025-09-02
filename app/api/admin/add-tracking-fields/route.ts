import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Adding tracking fields to orders table...')

    // Check if tracking fields already exist
    const checkResult = await prisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME IN ('trackingNumber', 'shippedAt')
    `) as any[]

    const existingFields = checkResult.map((row: any) => row.COLUMN_NAME)
    
    if (!existingFields.includes('trackingNumber')) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE orders 
        ADD COLUMN trackingNumber VARCHAR(255) NULL
      `)
      console.log('✅ Added trackingNumber column')
    }

    if (!existingFields.includes('shippedAt')) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE orders 
        ADD COLUMN shippedAt DATETIME NULL
      `)
      console.log('✅ Added shippedAt column')
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking fields added successfully'
    })

  } catch (error) {
    console.error('❌ Error adding tracking fields:', error)
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