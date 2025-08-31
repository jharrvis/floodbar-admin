const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addGmailColumnsSafe() {
  try {
    console.log('Adding Gmail SMTP columns to payment_settings table...')
    
    // Check if the table exists first
    const tables = await prisma.$queryRawUnsafe(`
      SHOW TABLES LIKE 'payment_settings'
    `)
    
    if (tables.length === 0) {
      console.log('❌ payment_settings table not found!')
      return
    }
    
    // Check existing columns
    const columns = await prisma.$queryRawUnsafe(`
      DESCRIBE payment_settings
    `)
    
    const columnNames = columns.map(col => col.Field)
    console.log('📋 Existing columns:', columnNames)
    
    // Add each Gmail column if it doesn't exist
    const gmailColumns = [
      { name: 'gmailUser', type: 'VARCHAR(255)', default: "''" },
      { name: 'gmailAppPassword', type: 'VARCHAR(255)', default: "''" },
      { name: 'isEmailEnabled', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'emailFrom', type: 'VARCHAR(255)', default: "'FloodBar'" }
    ]
    
    for (const col of gmailColumns) {
      if (!columnNames.includes(col.name)) {
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE payment_settings 
            ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
          `)
          console.log(`✅ Added column: ${col.name}`)
        } catch (error) {
          console.log(`⚠️  Failed to add ${col.name}:`, error.message)
        }
      } else {
        console.log(`ℹ️  Column ${col.name} already exists`)
      }
    }
    
    // Verify the new structure
    const updatedColumns = await prisma.$queryRawUnsafe(`
      DESCRIBE payment_settings
    `)
    
    console.log('\n📋 Updated table structure:')
    updatedColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`)
    })
    
    console.log('\n✅ Gmail columns setup completed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addGmailColumnsSafe()