import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, trackingNumber, shippingService } = await request.json()

    if (!orderId || !customerName || !customerEmail || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📧 Sending shipped notification email to:', customerEmail)

    // Get email settings
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length === 0) {
      console.log('❌ No payment settings found')
      return NextResponse.json({
        success: false,
        error: 'Payment settings not found'
      }, { status: 500 })
    }

    const settings = settingsResult[0]

    if (!settings.isEmailEnabled) {
      console.log('ℹ️ Email notifications disabled')
      return NextResponse.json({
        success: true,
        message: 'Email notifications disabled - notification skipped'
      })
    }

    if (!settings.gmailUser || !settings.gmailAppPassword) {
      console.log('❌ Gmail credentials not configured')
      return NextResponse.json({
        success: false,
        error: 'Gmail credentials not configured'
      }, { status: 500 })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: settings.gmailUser,
        pass: settings.gmailAppPassword,
      },
    })

    // Email content
    const subject = `Pesanan Anda Telah Dikirim - Order #${orderId}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🚚 Pesanan Anda Telah Dikirim!</h2>
        
        <p>Halo <strong>${customerName}</strong>,</p>
        
        <p>Kabar baik! Pesanan Anda dengan Order ID <strong>#${orderId}</strong> telah dikirim dan sedang dalam perjalanan.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detail Pengiriman:</h3>
          <p><strong>Layanan Kurir:</strong> Indah Cargo</p>
          <p><strong>Nomor Resi:</strong> <span style="background-color: #dcfce7; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${trackingNumber}</span></p>
        </div>
        
        <p><strong>Cara melacak pesanan Anda:</strong></p>
        <ol>
          <li>Gunakan nomor resi di atas</li>
          <li>Kunjungi website <a href="https://www.indahonline.com/tracking/cek-resi" style="color: #2563eb; text-decoration: none;" target="_blank">https://www.indahonline.com/tracking/cek-resi</a></li>
          <li>Masukkan nomor resi untuk melacak posisi paket</li>
        </ol>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>💡 Tips:</strong> Simpan nomor resi ini dan pastikan ada orang di alamat tujuan saat paket tiba.
          </p>
        </div>
        
        <p>Terima kasih telah berbelanja dengan kami! Jika ada pertanyaan, jangan ragu untuk menghubungi customer service kami.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6b7280;">
          Email ini dikirim otomatis. Mohon tidak membalas email ini.<br>
          © FloodBar - Solusi Penahan Banjir Terpercaya
        </p>
      </div>
    `

    const textContent = `
Pesanan Anda Telah Dikirim!

Halo ${customerName},

Kabar baik! Pesanan Anda dengan Order ID #${orderId} telah dikirim dan sedang dalam perjalanan.

Detail Pengiriman:
- Layanan Kurir: Indah Cargo
- Nomor Resi: ${trackingNumber}

Cara melacak pesanan Anda:
1. Gunakan nomor resi di atas
2. Kunjungi website https://www.indahonline.com/tracking/cek-resi
3. Masukkan nomor resi untuk melacak posisi paket

Tips: Simpan nomor resi ini dan pastikan ada orang di alamat tujuan saat paket tiba.

Terima kasih telah berbelanja dengan kami! Jika ada pertanyaan, jangan ragu untuk menghubungi customer service kami.

--
© FloodBar - Solusi Penahan Banjir Terpercaya
    `

    // Send email
    const mailOptions = {
      from: `${settings.emailFrom || 'FloodBar'} <${settings.gmailUser}>`,
      to: customerEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Shipped notification email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'Shipped notification email sent successfully'
    })

  } catch (error) {
    console.error('❌ Error sending shipped notification email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}