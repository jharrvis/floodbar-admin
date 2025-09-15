const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

async function main() {
  try {
    console.log('Creating news table...')

    // Create news table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        imageUrl VARCHAR(500) NOT NULL DEFAULT '',
        sourceUrl VARCHAR(500) NOT NULL,
        sourceName VARCHAR(100) NOT NULL,
        publishedAt DATETIME(3) NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('News table created successfully!')

    // Insert sample news data
    console.log('Inserting sample news data...')
    
    const sampleNews = [
      {
        id: 'news-1',
        title: 'Dari Gelombang Rossby hingga Tata Ruang Bermasalah, Ini Penyebab Banjir di Bali',
        summary: '210 Peristiwa Bencana di Bali BPBD mencatat sebanyak 210 kejadian bencana alam di Bali sepanjang 2024.',
        imageUrl: 'https://cdn.pixabay.com/photo/2020/10/30/08/04/flood-5696948_1280.jpg',
        sourceUrl: 'https://example.com/bali-flood',
        sourceName: 'Inilah.com',
        publishedAt: '2025-09-12 10:00:00'
      },
      {
        id: 'news-2', 
        title: 'Seberapa Titik Banjir Jakarta (6 Juli 2025 Pukul 07.00 WIB)',
        summary: 'Hujan deras mengguyur Jakarta pada Senin, 7 Juli 2025 menyebabkan genangan di beberapa titik.',
        imageUrl: 'https://cdn.pixabay.com/photo/2017/11/09/21/41/hurricane-2934719_1280.jpg',
        sourceUrl: 'https://example.com/jakarta-flood',
        sourceName: 'Databoks',
        publishedAt: '2025-07-08 07:00:00'
      },
      {
        id: 'news-3',
        title: 'Banjir Rob Semarang Makin Parah',
        summary: 'Banjir rob di pesisir utara Semarang semakin parah dan mengancam permukiman warga.',
        imageUrl: 'https://cdn.pixabay.com/photo/2018/08/31/15/20/living-room-3645325_1280.jpg',
        sourceUrl: 'https://example.com/semarang-flood',
        sourceName: 'News Portal',
        publishedAt: '2025-09-10 15:30:00'
      },
      {
        id: 'news-4',
        title: 'Bekasi & Tangerang Terendam Banjir',
        summary: 'Daerah satelit Jakarta kembali terendam banjir akibat curah hujan tinggi dan drainase buruk.',
        imageUrl: 'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_1280.jpg',
        sourceUrl: 'https://example.com/bekasi-tangerang-flood',
        sourceName: 'Media Online',
        publishedAt: '2025-09-15 12:00:00'
      }
    ]

    for (const news of sampleNews) {
      await prisma.$executeRawUnsafe(`
        INSERT IGNORE INTO news (id, title, summary, imageUrl, sourceUrl, sourceName, publishedAt, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, news.id, news.title, news.summary, news.imageUrl, news.sourceUrl, news.sourceName, news.publishedAt, true)
    }

    console.log('Sample news data inserted successfully!')
    console.log('News table setup completed!')
    
  } catch (error) {
    console.error('Error setting up news table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})