import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Creating admin_settings table...')
    
    // Create the admin_settings table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id VARCHAR(191) NOT NULL,
        \`key\` VARCHAR(191) NOT NULL,
        value LONGTEXT NOT NULL,
        description LONGTEXT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY admin_settings_key_key (\`key\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `
    
    console.log('admin_settings table created successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'admin_settings table created successfully' 
    })
  } catch (error) {
    console.error('Error creating admin_settings table:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create admin_settings table: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}