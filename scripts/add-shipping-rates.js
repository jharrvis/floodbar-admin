const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

async function addShippingRates() {
  try {
    console.log('Creating shipping_rates table...')

    // Create shipping_rates table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS shipping_rates (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        idHarga VARCHAR(191) NULL,
        kodeJasa VARCHAR(191) NULL,
        cakupan VARCHAR(191) NULL,
        via VARCHAR(191) NULL,
        tipe VARCHAR(191) NULL,
        hargaOnline DECIMAL(10,2) NULL,
        hargaPks DECIMAL(10,2) NULL,
        asal VARCHAR(191) NULL,
        tujuan VARCHAR(191) NOT NULL,
        wilayah TEXT NULL,
        updateDate VARCHAR(191) NULL,
        jenis VARCHAR(191) NULL,
        varian VARCHAR(191) NULL,
        leadTime VARCHAR(191) NULL,
        kodeNegara VARCHAR(191) NULL,
        simbol VARCHAR(191) NULL,
        nilaiTukar DECIMAL(10,6) NULL,
        diskon VARCHAR(191) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE KEY unique_shipping_route (asal, tujuan, via)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('Shipping rates table created successfully!')
    
  } catch (error) {
    console.error('Error setting up shipping rates table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addShippingRates().catch((error) => {
  console.error(error)
  process.exit(1)
})