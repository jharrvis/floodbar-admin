import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface EmailData {
  to: string
  orderId: string
  orderData: any
}

export async function POST(request: NextRequest) {
  try {
    const { to, orderId, orderData }: EmailData = await request.json()

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">FloodBar Invoice</h1>
          <p style="margin: 5px 0;">Order ID: ${orderId}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1e40af; margin-top: 0;">Detail Pesanan</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Informasi Customer</h3>
            <p><strong>Nama:</strong> ${orderData.customer.name}</p>
            <p><strong>Email:</strong> ${orderData.customer.email}</p>
            <p><strong>Telepon:</strong> ${orderData.customer.phone}</p>
            <p><strong>Alamat:</strong> ${orderData.customer.address}, ${orderData.customer.city} ${orderData.customer.postalCode}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Spesifikasi Produk</h3>
            <p><strong>Ukuran:</strong> ${orderData.productConfig.width}cm x ${orderData.productConfig.height}cm</p>
            <p><strong>Ketebalan:</strong> ${orderData.productConfig.thickness}mm</p>
            <p><strong>Jumlah:</strong> ${orderData.productConfig.quantity} pcs</p>
            <p><strong>Finishing:</strong> ${orderData.productConfig.finish}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Pengiriman</h3>
            <p><strong>Asal:</strong> ${orderData.shipping.origin}</p>
            <p><strong>Tujuan:</strong> ${orderData.shipping.destination}</p>
            <p><strong>Layanan:</strong> ${orderData.shipping.service}</p>
            <p><strong>Berat:</strong> ${orderData.shipping.weight}kg</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Ringkasan Pembayaran</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal Produk:</span>
              <span>${formatCurrency(orderData.orderSummary.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Ongkos Kirim:</span>
              <span>${formatCurrency(orderData.orderSummary.shippingCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Biaya Admin:</span>
              <span>${formatCurrency(orderData.orderSummary.adminFee)}</span>
            </div>
            <hr style="margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #1e40af;">
              <span>Total Pembayaran:</span>
              <span>${formatCurrency(orderData.orderSummary.grandTotal)}</span>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #92400e;">Instruksi Pembayaran</h3>
            <p style="margin-bottom: 0; color: #92400e;">
              Silakan lakukan pembayaran sesuai metode yang dipilih: <strong>${orderData.payment.method}</strong>
              ${orderData.payment.provider ? ` via ${orderData.payment.provider}` : ''}.
              Tim kami akan menghubungi Anda setelah pembayaran dikonfirmasi.
            </p>
          </div>
        </div>

        <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Terima kasih telah mempercayai FloodBar!</p>
          <p style="margin: 5px 0; font-size: 12px;">Jika ada pertanyaan, hubungi customer service kami.</p>
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
          secure: false, // true for 465, false for other ports
          auth: {
            user: emailSettings.gmailUser,
            pass: emailSettings.gmailAppPassword
          }
        })

        // Send email
        const info = await transporter.sendMail({
          from: `"${emailSettings.emailFrom}" <${emailSettings.gmailUser}>`,
          to: to,
          subject: `Invoice FloodBar - Order ${orderId}`,
          html: emailContent
        })

        console.log('Email sent successfully:', info.messageId)

        return NextResponse.json({
          success: true,
          message: 'Email notification sent successfully',
          messageId: info.messageId
        })

      } catch (emailError) {
        console.error('SMTP Error:', emailError)
        
        // Fallback - log email content
        console.log('Email would be sent to:', to)
        console.log('Subject: Invoice FloodBar - Order', orderId)
        
        return NextResponse.json({
          success: true,
          message: 'Email logged (SMTP error)',
          fallback: true
        })
      }
    } else {
      // Fallback - log email content when email not enabled
      console.log('Email notifications disabled or not configured')
      console.log('Email would be sent to:', to)
      console.log('Subject: Invoice FloodBar - Order', orderId)
      
      return NextResponse.json({
        success: true,
        message: 'Email logged (SMTP not enabled)',
        fallback: true
      })
    }

  } catch (error) {
    console.error('Error sending email notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}