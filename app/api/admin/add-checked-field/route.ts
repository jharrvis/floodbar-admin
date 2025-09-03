import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Add isChecked column to orders table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE orders 
      ADD COLUMN isChecked BOOLEAN DEFAULT FALSE
    `)

    console.log('✅ Added isChecked column to orders table')

    return NextResponse.json({
      success: true,
      message: 'isChecked column added successfully'
    })

  } catch (error) {
    console.error('Error adding isChecked column:', error)
    
    // Check if column already exists
    if (error instanceof Error && error.message.includes('Duplicate column name')) {
      return NextResponse.json({
        success: true,
        message: 'isChecked column already exists'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add isChecked column' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to add isChecked column to orders table',
    endpoint: '/api/admin/add-checked-field'
  })
}