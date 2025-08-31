const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createPageContentTable() {
  try {
    console.log('Creating page_contents table...')
    
    // Check if table already exists
    const tables = await prisma.$queryRawUnsafe(`
      SHOW TABLES LIKE 'page_contents'
    `)
    
    if (tables.length > 0) {
      console.log('✅ page_contents table already exists')
      return
    }
    
    // Create page_contents table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE page_contents (
        id VARCHAR(255) PRIMARY KEY,
        page_type ENUM('payment_success', 'payment_failure') NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        subtitle VARCHAR(500) DEFAULT '',
        content_sections JSON,
        contact_info JSON,
        is_active BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY uk_page_type (page_type),
        INDEX idx_page_type (page_type),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✅ page_contents table created successfully!')
    
    // Insert default content
    console.log('Inserting default page contents...')
    
    // Default success page content
    await prisma.$executeRawUnsafe(`
      INSERT INTO page_contents (
        id, page_type, title, subtitle, content_sections, contact_info, is_active
      ) VALUES (
        'success-default', 
        'payment_success',
        'Pembayaran Berhasil!',
        'Terima kasih! Pembayaran Anda telah berhasil diproses dan pesanan sedang dipersiapkan.',
        JSON_OBJECT(
          'steps', JSON_ARRAY(
            JSON_OBJECT('icon', 'mail', 'title', 'Konfirmasi Email', 'description', 'Invoice dan detail pesanan telah dikirim ke email Anda.'),
            JSON_OBJECT('icon', 'message', 'title', 'Notifikasi WhatsApp', 'description', 'Tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi produksi.'),
            JSON_OBJECT('icon', 'package', 'title', 'Proses Produksi', 'description', 'Pesanan Anda akan segera diproses dan dikirim sesuai estimasi yang diberikan.')
          ),
          'estimasi_produksi', '5-7 hari kerja'
        ),
        JSON_OBJECT(
          'customer_service_email', 'customer@floodbar.com',
          'whatsapp', '+62-xxx-xxxx-xxxx'
        ),
        TRUE
      )
    `)
    
    // Default failure page content  
    await prisma.$executeRawUnsafe(`
      INSERT INTO page_contents (
        id, page_type, title, subtitle, content_sections, contact_info, is_active
      ) VALUES (
        'failure-default',
        'payment_failure', 
        'Pembayaran Gagal',
        'Maaf, pembayaran Anda tidak dapat diproses. Jangan khawatir, pesanan Anda masih tersimpan.',
        JSON_OBJECT(
          'possible_reasons', JSON_ARRAY(
            'Dana di kartu kredit atau rekening tidak mencukupi',
            'Kartu kredit sudah kadaluarsa atau diblokir', 
            'Koneksi internet terputus selama proses pembayaran',
            'Sesi pembayaran sudah kadaluarsa (lebih dari 24 jam)',
            'Pembayaran dibatalkan sebelum selesai'
          ),
          'alternative_options', JSON_ARRAY(
            JSON_OBJECT('icon', 'message', 'title', 'Transfer Bank Manual', 'description', 'Hubungi customer service untuk mendapatkan rekening tujuan transfer manual.'),
            JSON_OBJECT('icon', 'mail', 'title', 'Bantuan via Email', 'description', 'Kirim email dengan Order ID Anda untuk mendapatkan bantuan pembayaran.')
          )
        ),
        JSON_OBJECT(
          'customer_service_email', 'customer@floodbar.com', 
          'whatsapp', '+62-xxx-xxxx-xxxx'
        ),
        TRUE
      )
    `)
    
    console.log('✅ Default page contents inserted successfully!')
    
  } catch (error) {
    console.error('❌ Error creating page_contents table:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createPageContentTable()