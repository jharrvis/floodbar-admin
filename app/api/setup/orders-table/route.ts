import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create orders table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        customerEmail VARCHAR(255) NOT NULL,
        customerPhone VARCHAR(50) NOT NULL,
        customerAddress TEXT NOT NULL,
        customerCity VARCHAR(100) NOT NULL,
        customerPostalCode VARCHAR(20) NOT NULL,
        productWidth DECIMAL(10,2) NOT NULL,
        productHeight DECIMAL(10,2) NOT NULL,
        productThickness DECIMAL(10,2) NOT NULL,
        productQuantity INT NOT NULL,
        productFinish VARCHAR(100) NOT NULL,
        shippingOrigin VARCHAR(255) NOT NULL,
        shippingDestination VARCHAR(255) NOT NULL,
        shippingWeight DECIMAL(10,2) NOT NULL,
        shippingService VARCHAR(255) NOT NULL,
        shippingCost DECIMAL(15,2) NOT NULL,
        paymentMethod VARCHAR(100) NOT NULL,
        paymentProvider VARCHAR(100),
        subtotal DECIMAL(15,2) NOT NULL,
        adminFee DECIMAL(15,2) NOT NULL,
        grandTotal DECIMAL(15,2) NOT NULL,
        status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    console.log('Orders table created successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Orders table created successfully' 
    })

  } catch (error) {
    console.error('Error creating orders table:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create orders table' },
      { status: 500 }
    )
  }
}