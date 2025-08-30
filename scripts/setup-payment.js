const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupPaymentSettings() {
  try {
    // Create payment_settings table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id VARCHAR(255) PRIMARY KEY,
        xenditApiKey VARCHAR(255) DEFAULT '',
        xenditWebhookToken VARCHAR(255) DEFAULT '',
        xenditPublicKey VARCHAR(255) DEFAULT '',
        isXenditEnabled BOOLEAN DEFAULT true,
        supportedMethodsJson TEXT DEFAULT '["credit_card","bank_transfer","ewallet","qris"]',
        minimumAmount DECIMAL(10,2) DEFAULT 10000,
        maximumAmount DECIMAL(12,2) DEFAULT 50000000,
        adminFee DECIMAL(10,2) DEFAULT 5000,
        adminFeeType ENUM('fixed', 'percentage') DEFAULT 'fixed',
        successRedirectUrl VARCHAR(255) DEFAULT '/payment/success',
        failureRedirectUrl VARCHAR(255) DEFAULT '/payment/failure',
        environment ENUM('sandbox', 'production') DEFAULT 'sandbox',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Insert default payment settings
    await prisma.$executeRawUnsafe(`
      INSERT INTO payment_settings (
        id, xenditApiKey, xenditWebhookToken, xenditPublicKey,
        isXenditEnabled, supportedMethodsJson, minimumAmount, maximumAmount,
        adminFee, adminFeeType, successRedirectUrl, failureRedirectUrl, environment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        isXenditEnabled = VALUES(isXenditEnabled),
        xenditApiKey = COALESCE(NULLIF(xenditApiKey, ''), VALUES(xenditApiKey)),
        updatedAt = CURRENT_TIMESTAMP
    `,
      'payment-' + Date.now(),
      'xnd_development_test_api_key', // Placeholder API key
      'development_webhook_token', // Placeholder webhook token
      'xnd_public_development_key', // Placeholder public key
      true, // Enable Xendit
      '["credit_card","bank_transfer","ewallet","qris"]',
      10000,
      50000000,
      5000,
      'fixed',
      '/payment/success',
      '/payment/failure',
      'sandbox'
    )

    console.log('Payment settings created successfully')
    
    // Verify the settings
    const settings = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `)
    
    console.log('Current payment settings:', settings)

  } catch (error) {
    console.error('Error setting up payment settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPaymentSettings()