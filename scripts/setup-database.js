const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

async function main() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connection successful!')

    console.log('Creating database tables...')

    // Create users table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(191) NOT NULL,
        role VARCHAR(191) NOT NULL DEFAULT 'viewer',
        status VARCHAR(191) NOT NULL DEFAULT 'active',
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        lastLogin DATETIME(3) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create landing_pages table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS landing_pages (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        heroTitle TEXT NOT NULL,
        heroSubtitle TEXT NOT NULL,
        heroBackgroundImage VARCHAR(191) NULL,
        featuresJson TEXT NOT NULL,
        productsJson TEXT NOT NULL,
        contactPhone VARCHAR(191) NOT NULL,
        contactEmail VARCHAR(191) NOT NULL,
        contactAddress TEXT NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create settings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        siteName VARCHAR(191) NOT NULL,
        siteDescription TEXT NOT NULL,
        adminEmail VARCHAR(191) NOT NULL,
        maintenanceMode BOOLEAN NOT NULL DEFAULT false,
        allowRegistration BOOLEAN NOT NULL DEFAULT false,
        emailNotifications BOOLEAN NOT NULL DEFAULT true,
        backupFrequency VARCHAR(191) NOT NULL DEFAULT 'daily',
        timezone VARCHAR(191) NOT NULL DEFAULT 'Asia/Jakarta',
        language VARCHAR(191) NOT NULL DEFAULT 'id',
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('Database tables created successfully!')

    // Insert default admin user
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // admin123
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO users (id, name, email, password, role, status) 
      VALUES ('admin-1', 'Admin Utama', 'admin@floodbar.com', '${hashedPassword}', 'admin', 'active')
    `)

    // Insert default landing page data
    const features = JSON.stringify([
      {
        title: 'Mudah Dipasang',
        description: 'Instalasi cepat tanpa perlu keahlian khusus. Cukup 5 menit untuk perlindungan maksimal.',
        icon: 'wrench'
      },
      {
        title: 'Tahan Lama',
        description: 'Material berkualitas tinggi yang tahan terhadap cuaca ekstrem dan tekanan air.',
        icon: 'shield'
      },
      {
        title: 'Efektif',
        description: 'Mampu menahan air hingga ketinggian 1.5 meter dengan sistem kedap air yang sempurna.',
        icon: 'droplets'
      }
    ])

    const products = JSON.stringify([
      {
        name: 'FloodBar Basic',
        price: 'Rp 2.500.000',
        description: 'Solusi dasar untuk pintu standar rumah tinggal',
        image: '/product-basic.jpg',
        features: [
          'Tinggi maksimal 1 meter',
          'Lebar hingga 1.2 meter',
          'Material aluminium',
          'Garansi 2 tahun'
        ]
      },
      {
        name: 'FloodBar Pro',
        price: 'Rp 4.500.000',
        description: 'Solusi profesional untuk bangunan komersial',
        image: '/product-pro.jpg',
        features: [
          'Tinggi maksimal 1.5 meter',
          'Lebar hingga 2 meter',
          'Material stainless steel',
          'Garansi 5 tahun'
        ]
      }
    ])

    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO landing_pages (
        id, heroTitle, heroSubtitle, heroBackgroundImage, 
        featuresJson, productsJson, contactPhone, contactEmail, contactAddress
      ) VALUES (
        'landing-1', 
        'FloodBar - Sekat Pintu Anti Banjir Terdepan',
        'Lindungi rumah dan bisnis Anda dari banjir dengan solusi inovatif FloodBar. Mudah dipasang, tahan lama, dan efektif.',
        '/hero-bg.jpg',
        '${features}',
        '${products}',
        '+62 21 1234-5678',
        'info@floodbar.com',
        'Jl. Contoh No. 123, Jakarta Selatan'
      )
    `)

    // Insert default settings
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO settings (
        id, siteName, siteDescription, adminEmail, 
        maintenanceMode, allowRegistration, emailNotifications
      ) VALUES (
        'settings-1',
        'Floodbar Admin Panel',
        'Admin panel untuk mengelola halaman penjualan floodbar',
        'admin@floodbar.com',
        false,
        false,
        true
      )
    `)

    console.log('Default data inserted successfully!')
    console.log('Setup completed!')
    
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})