const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

async function addProductConfig() {
  try {
    console.log('Creating product_config table...')

    // Create product_config table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS product_config (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        priceUnder60cm DECIMAL(10,2) NOT NULL DEFAULT 170.00,
        priceOver60cm DECIMAL(10,2) NOT NULL DEFAULT 120.00,
        packingThickness DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        weightConstant DECIMAL(10,6) NOT NULL DEFAULT 0.0002,
        minShippingWeight DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        pickupCost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        insuranceCost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        warehouseName VARCHAR(191) NOT NULL DEFAULT 'Gudang Utama',
        warehouseAddress TEXT NOT NULL DEFAULT '',
        warehouseCity VARCHAR(191) NOT NULL DEFAULT '',
        warehouseProvince VARCHAR(191) NOT NULL DEFAULT '',
        warehousePostalCode VARCHAR(191) NOT NULL DEFAULT '',
        warehousePhone VARCHAR(191) NOT NULL DEFAULT '',
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('Product config table created successfully!')

    // Insert default configuration
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO product_config (
        id, priceUnder60cm, priceOver60cm, packingThickness, 
        weightConstant, minShippingWeight, pickupCost, insuranceCost,
        warehouseName, warehouseAddress, warehouseCity, warehouseProvince,
        warehousePostalCode, warehousePhone
      ) VALUES (
        'config-1', 170.00, 120.00, 10.00, 0.0002, 10.00, 0.00, 0.00,
        'Gudang Utama FloodBar', 'Jl. Industri No. 123', 'Jakarta Selatan', 
        'DKI Jakarta', '12560', '+62 21 1234-5678'
      )
    `)

    console.log('Default product configuration inserted successfully!')
    
  } catch (error) {
    console.error('Error setting up product config:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addProductConfig().catch((error) => {
  console.error(error)
  process.exit(1)
})