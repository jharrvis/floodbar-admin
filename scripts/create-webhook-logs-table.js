const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createWebhookLogsTable() {
  try {
    console.log('Creating webhook_logs table...')
    
    // Check if table already exists
    const tables = await prisma.$queryRawUnsafe(`
      SHOW TABLES LIKE 'webhook_logs'
    `)
    
    if (tables.length > 0) {
      console.log('✅ webhook_logs table already exists')
      return
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
    
  } catch (error) {
    console.error('❌ Error creating webhook_logs table:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createWebhookLogsTable()