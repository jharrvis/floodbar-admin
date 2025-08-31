const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Checking payment_settings table structure...')
    
    const result = await prisma.$queryRawUnsafe('DESCRIBE payment_settings')
    console.log('Table structure:')
    console.log(JSON.stringify(result, null, 2))
    
    console.log('\nChecking current data...')
    const data = await prisma.$queryRawUnsafe('SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1')
    console.log('Current data:')
    console.log(JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()