import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface PaymentConfirmationData {
  orderId: string
  customerEmail: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount }: PaymentConfirmationData = await request.json()

    // Get order details
    const orderResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM orders WHERE id = ?
    `, orderId) as any[]

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult[0]

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Create email content for payment confirmation
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">✅ Pembayaran Berhasil!</h1>
          <p style="margin: 5px 0;">FloodBar Order #${orderId}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #059669; margin-top: 0;">Pembayaran Anda telah dikonfirmasi!</h2>
            <p style="color: #047857; margin: 0;">
              Terima kasih! Pembayaran sebesar <strong>${formatCurrency(amount)}</strong> telah berhasil diproses.
            </p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Informasi Pesanan</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Status:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 4px; font-size: 12px;">PAID</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Produk:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">FloodBar Custom ${order.productWidth}cm x ${order.productHeight}cm</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Jumlah:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${order.productQuantity} pcs</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Total Dibayar:</strong></td>
                <td style="padding: 8px 0;"><strong style="color: #059669;">${formatCurrency(amount)}</strong></td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Langkah Selanjutnya</h3>
            <div style="padding-left: 0;">
              <p style="margin-bottom: 10px;">🏭 <strong>Proses Produksi:</strong> Pesanan Anda akan segera masuk ke tahap produksi</p>
              <p style="margin-bottom: 10px;">📱 <strong>Update Status:</strong> Tim kami akan menghubungi Anda via WhatsApp untuk update progress</p>
              <p style="margin-bottom: 10px;">📦 <strong>Pengiriman:</strong> Produk akan dikirim sesuai alamat: ${order.customerAddress}, ${order.customerCity}</p>
              <p style="margin-bottom: 0;">⏱️ <strong>Estimasi:</strong> Proses produksi membutuhkan waktu 5-7 hari kerja</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #92400e;">📞 Hubungi Kami</h3>
            <p style="margin-bottom: 0; color: #92400e;">
              Jika ada pertanyaan tentang pesanan Anda, silakan hubungi customer service kami di 
              <strong>customer@floodbar.com</strong> atau WhatsApp dengan menyebutkan Order ID <strong>#${orderId}</strong>.
            </p>
          </div>
        </div>

        <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Terima kasih telah memilih FloodBar!</p>
          <p style="margin: 5px 0; font-size: 12px;">Email ini dikirim otomatis setelah pembayaran berhasil.</p>
        </div>
      </div>
    `

    // Get email settings from database
    let emailSettings
    try {
      const settingsResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]

      if (settingsResult.length && settingsResult[0].isEmailEnabled) {
        emailSettings = {
          gmailUser: settingsResult[0].gmailUser,
          gmailAppPassword: settingsResult[0].gmailAppPassword,
          emailFrom: settingsResult[0].emailFrom || 'FloodBar',
          isEnabled: true
        }
      } else {
        emailSettings = { isEnabled: false }
      }
    } catch (dbError) {
      console.log('Could not load email settings from database:', dbError instanceof Error ? dbError.message : dbError)
      emailSettings = { isEnabled: false }
    }

    // SMTP Gmail Configuration
    if (emailSettings.isEnabled && emailSettings.gmailUser && emailSettings.gmailAppPassword) {
      try {
        // Create SMTP transporter
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: emailSettings.gmailUser,
            pass: emailSettings.gmailAppPassword
          }
        })

        // Send email
        const info = await transporter.sendMail({
          from: `"${emailSettings.emailFrom}" <${emailSettings.gmailUser}>`,
          to: customerEmail,
          subject: `✅ Pembayaran Berhasil - FloodBar Order #${orderId}`,
          html: emailContent
        })

        console.log('Payment confirmation email sent successfully:', info.messageId)

        return NextResponse.json({
          success: true,
          message: 'Payment confirmation email sent successfully',
          messageId: info.messageId
        })

      } catch (emailError) {
        console.error('SMTP Error for payment confirmation:', emailError)
        
        return NextResponse.json({
          success: true,
          message: 'Payment confirmation email logged (SMTP error)',
          fallback: true
        })
      }
    } else {
      // Fallback - log email content when email not enabled
      console.log('Payment confirmation email notifications disabled')
      console.log('Email would be sent to:', customerEmail)
      console.log('Subject: Payment Confirmation - FloodBar Order', orderId)
      
      return NextResponse.json({
        success: true,
        message: 'Payment confirmation email logged (SMTP not enabled)',
        fallback: true
      })
    }

  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send payment confirmation email' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}