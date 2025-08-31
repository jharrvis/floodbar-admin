const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addGmailColumns() {
  try {
    console.log('Adding Gmail SMTP columns to payment_settings table...')
    
    // Add Gmail SMTP columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE payment_settings 
      ADD COLUMN IF NOT EXISTS gmailUser VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS gmailAppPassword VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS isEmailEnabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS emailFrom VARCHAR(255) DEFAULT 'FloodBar'
    `)

    console.log('Gmail SMTP columns added successfully')
    
    // Verify the new structure
    const result = await prisma.$queryRawUnsafe('DESCRIBE payment_settings')
    console.log('Updated table structure:')
    result.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`)
    })
    
  } catch (error) {
    console.error('Error adding Gmail columns:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addGmailColumns()