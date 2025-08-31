import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Creating webhook_logs table...')
    
    // Check if table already exists
    const tables = await prisma.$queryRawUnsafe(`
      SHOW TABLES LIKE 'webhook_logs'
    `) as any[]
    
    if (tables.length > 0) {
      console.log('✅ webhook_logs table already exists')
      return NextResponse.json({
        success: true,
        message: 'webhook_logs table already exists'
      })
    }
    
    // Create webhook_logs table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE webhook_logs (
        id VARCHAR(255) PRIMARY KEY,
        orderId VARCHAR(255),
        provider VARCHAR(50) NOT NULL,
        eventType VARCHAR(100) NOT NULL,
        status VARCHAR(50),
        webhookData JSON,
        processedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_order_id (orderId),
        INDEX idx_provider (provider),
        INDEX idx_processed_at (processedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✅ webhook_logs table created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'webhook_logs table created successfully'
    })
    
  } catch (error) {
    console.error('❌ Error creating webhook_logs table:', error)
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