const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixGmailColumns() {
  try {
    console.log('Attempting to add Gmail columns to payment_settings...')
    
    // Try to add Gmail columns - this will fail gracefully if they already exist
    const alterQueries = [
      `ALTER TABLE payment_settings ADD COLUMN gmailUser VARCHAR(255) DEFAULT ''`,
      `ALTER TABLE payment_settings ADD COLUMN gmailAppPassword VARCHAR(255) DEFAULT ''`, 
      `ALTER TABLE payment_settings ADD COLUMN isEmailEnabled BOOLEAN DEFAULT false`,
      `ALTER TABLE payment_settings ADD COLUMN emailFrom VARCHAR(255) DEFAULT 'FloodBar'`
    ]
    
    for (const query of alterQueries) {
      try {
        await prisma.$executeRawUnsafe(query)
        console.log('✓ Added column:', query.split('ADD COLUMN')[1].split('VARCHAR')[0].trim())
      } catch (error) {
        if (error.message.includes('Duplicate column name') || 
            error.message.includes('already exists') ||
            error.message.includes('column "gmailuser" of relation "payment_settings" already exists')) {
          console.log('ℹ Column already exists:', query.split('ADD COLUMN')[1].split('VARCHAR')[0].split('BOOLEAN')[0].trim())
        } else {
          console.log('⚠ Error adding column:', error.message)
        }
      }
    }

    // Verify by trying to select Gmail fields
    console.log('\nTesting Gmail fields...')
    const result = await prisma.$queryRawUnsafe(`
      SELECT id, gmailUser, gmailAppPassword, isEmailEnabled, emailFrom 
      FROM payment_settings 
      ORDER BY createdAt DESC LIMIT 1
    `)
    
    console.log('✓ Gmail columns are working!')
    console.log('Current Gmail settings:', result)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixGmailColumns()