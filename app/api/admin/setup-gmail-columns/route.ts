import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Adding Gmail SMTP columns to payment_settings table...')
    
    // Check existing columns first
    let columns
    try {
      columns = await prisma.$queryRawUnsafe(`
        DESCRIBE payment_settings
      `) as any[]
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Could not access payment_settings table',
        details: error.message
      }, { status: 500 })
    }
    
    const columnNames = columns.map((col: any) => col.Field)
    console.log('Existing columns:', columnNames)
    
    // Add each Gmail column if it doesn't exist
    const gmailColumns = [
      { name: 'gmailUser', type: 'VARCHAR(255)', default: "''" },
      { name: 'gmailAppPassword', type: 'VARCHAR(255)', default: "''" },
      { name: 'isEmailEnabled', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'emailFrom', type: 'VARCHAR(255)', default: "'FloodBar'" }
    ]
    
    const results = []
    
    for (const col of gmailColumns) {
      if (!columnNames.includes(col.name)) {
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE payment_settings 
            ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
          `)
          results.push({ column: col.name, status: 'added' })
          console.log(`Added column: ${col.name}`)
        } catch (error) {
          results.push({ 
            column: col.name, 
            status: 'failed', 
            error: error instanceof Error ? error.message : String(error)
          })
          console.log(`Failed to add ${col.name}:`, error)
        }
      } else {
        results.push({ column: col.name, status: 'exists' })
        console.log(`Column ${col.name} already exists`)
      }
    }
    
    // Get updated structure
    const updatedColumns = await prisma.$queryRawUnsafe(`
      DESCRIBE payment_settings
    `) as any[]
    
    return NextResponse.json({
      success: true,
      message: 'Gmail columns setup completed',
      results,
      tableStructure: updatedColumns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        default: col.Default
      }))
    })
    
  } catch (error) {
    console.error('Setup Gmail columns error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup Gmail columns',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}