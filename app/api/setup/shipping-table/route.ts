import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create shipping_rates table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS shipping_rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tujuan VARCHAR(255) NOT NULL,
        harga_per_kg DECIMAL(10,2) NOT NULL,
        estimasi_hari VARCHAR(20),
        aktif BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tujuan (tujuan)
      )
    `)

    // Insert sample data if table is empty
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM shipping_rates
    `) as any[]

    if (countResult[0].count === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO shipping_rates (tujuan, harga_per_kg, estimasi_hari) VALUES
        ('Jakarta', 15000, '1-2 hari'),
        ('Bandung', 18000, '2-3 hari'),
        ('Surabaya', 22000, '3-4 hari'),
        ('Semarang', 20000, '2-3 hari'),
        ('Yogyakarta', 21000, '3-4 hari'),
        ('Medan', 25000, '4-5 hari'),
        ('Palembang', 23000, '3-4 hari'),
        ('Makassar', 28000, '5-6 hari'),
        ('Denpasar', 24000, '4-5 hari'),
        ('Balikpapan', 26000, '5-6 hari'),
        ('Pontianak', 27000, '5-6 hari'),
        ('Manado', 30000, '6-7 hari'),
        ('Banjarmasin', 25000, '4-5 hari'),
        ('Pekanbaru', 24000, '4-5 hari'),
        ('Padang', 26000, '5-6 hari'),
        ('Jambi', 23000, '4-5 hari'),
        ('Lampung', 20000, '3-4 hari'),
        ('Bengkulu', 25000, '4-5 hari'),
        ('Aceh', 28000, '6-7 hari'),
        ('Papua', 35000, '7-10 hari'),
        ('Malang', 22000, '3-4 hari'),
        ('Solo', 20000, '2-3 hari'),
        ('Bekasi', 16000, '1-2 hari'),
        ('Tangerang', 15500, '1-2 hari'),
        ('Depok', 16000, '1-2 hari'),
        ('Bogor', 17000, '2-3 hari'),
        ('Cirebon', 19000, '2-3 hari'),
        ('Tasikmalaya', 20000, '3-4 hari'),
        ('Purwokerto', 21000, '3-4 hari'),
        ('Tegal', 19500, '2-3 hari')
      `)
    }

    console.log('Shipping rates table created and populated successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Shipping rates table setup completed' 
    })

  } catch (error) {
    console.error('Error setting up shipping rates table:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup shipping rates table' },
      { status: 500 }
    )
  }
}