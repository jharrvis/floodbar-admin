import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface AdminEmailData {
  orderId: string
  orderData: any
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData }: AdminEmailData = await request.json()

    // Get admin email from settings
    let adminEmail = 'admin@floodbar.id' // fallback
    try {
      const settingsResult = await prisma.$queryRawUnsafe(`
        SELECT adminEmail FROM settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]
      
      console.log('Admin email query result:', settingsResult)
      
      if (settingsResult.length > 0 && settingsResult[0].adminEmail) {
        adminEmail = settingsResult[0].adminEmail
        console.log('Admin email loaded from settings:', adminEmail)
      } else {
        console.log('No admin email found in settings, using fallback:', adminEmail)
      }
    } catch (error) {
      console.log('Could not load admin email from settings, using fallback:', adminEmail, 'Error:', error)
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Get cost breakdown for more detailed information
    let costBreakdown = null
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://floodbar.id'}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: orderData.productConfig.width,
          height: orderData.productConfig.height,
          includePickup: false,
          includeInsurance: false
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          costBreakdown = result.data
        }
      }
    } catch (error) {
      console.log('Could not load cost breakdown, using basic info')
    }

    // Create detailed admin email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 PESANAN BARU MASUK</h1>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">Order ID: ${orderId}</p>
          <p style="margin: 5px 0; font-size: 14px;">Diterima pada: ${formatDate(new Date().toISOString())}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <!-- Customer Info -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <h2 style="margin-top: 0; color: #1e40af; display: flex; align-items: center;">
              👤 Informasi Customer
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Nama:</td>
                <td style="padding: 8px 0;">${orderData.customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${orderData.customer.email}">${orderData.customer.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Telepon:</td>
                <td style="padding: 8px 0;"><a href="tel:${orderData.customer.phone}">${orderData.customer.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Kota:</td>
                <td style="padding: 8px 0;">${orderData.customer.city}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Alamat:</td>
                <td style="padding: 8px 0;">${orderData.customer.address}, ${orderData.customer.city} ${orderData.customer.postalCode}</td>
              </tr>
            </table>
          </div>

          <!-- Product Info -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
            <h2 style="margin-top: 0; color: #059669; display: flex; align-items: center;">
              📦 Spesifikasi Produk
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${orderData.productConfig.model ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Model:</td>
                <td style="padding: 8px 0;">${orderData.productConfig.model}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Ukuran:</td>
                <td style="padding: 8px 0;"><strong>${orderData.productConfig.width}cm × ${orderData.productConfig.height}cm</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Ketebalan:</td>
                <td style="padding: 8px 0;">${orderData.productConfig.thickness}mm</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Jumlah:</td>
                <td style="padding: 8px 0;"><strong>${orderData.productConfig.quantity} pcs</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Finishing:</td>
                <td style="padding: 8px 0;">${orderData.productConfig.finish}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Info -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #7c3aed;">
            <h2 style="margin-top: 0; color: #7c3aed; display: flex; align-items: center;">
              🚚 Informasi Pengiriman
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Asal:</td>
                <td style="padding: 8px 0;">Kota Kudus</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tujuan:</td>
                <td style="padding: 8px 0;">${orderData.shipping.destination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Layanan:</td>
                <td style="padding: 8px 0;">${orderData.shipping.service}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Berat:</td>
                <td style="padding: 8px 0;">${orderData.shipping.weight}kg</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Ongkir:</td>
                <td style="padding: 8px 0;"><strong>${formatCurrency(orderData.orderSummary.shippingCost)}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Cost Breakdown -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <h2 style="margin-top: 0; color: #f59e0b; display: flex; align-items: center;">
              💰 Rincian Biaya Detail
            </h2>
            ${costBreakdown ? `
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 60%;">Biaya Produk (${orderData.productConfig.width}×${orderData.productConfig.height}cm):</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(costBreakdown.pricing.basePrice)}</td>
              </tr>
              ${costBreakdown.costs.map((cost: any) => `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${cost.description}:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(cost.amount)}</td>
              </tr>
              `).join('')}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold;">Subtotal Produk:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold;">${formatCurrency(costBreakdown.pricing.totalPrice)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Ongkos Kirim:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.shippingCost)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Biaya Admin:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.adminFee || 0)}</td>
              </tr>
              <tr style="border-top: 3px solid #f59e0b; background-color: #fef3c7;">
                <td style="padding: 15px 0; font-weight: bold; font-size: 18px; color: #92400e;">TOTAL PEMBAYARAN:</td>
                <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #92400e;">${formatCurrency(orderData.orderSummary.grandTotal)}</td>
              </tr>
            </table>
            ` : `
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 60%;">Subtotal Produk:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Ongkos Kirim:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.shippingCost)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Biaya Admin:</td>
                <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.adminFee || 0)}</td>
              </tr>
              <tr style="border-top: 3px solid #f59e0b; background-color: #fef3c7;">
                <td style="padding: 15px 0; font-weight: bold; font-size: 18px; color: #92400e;">TOTAL PEMBAYARAN:</td>
                <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #92400e;">${formatCurrency(orderData.orderSummary.grandTotal)}</td>
              </tr>
            </table>
            `}
          </div>

          <!-- Payment Info -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
            <h2 style="margin-top: 0; color: #ec4899; display: flex; align-items: center;">
              💳 Informasi Pembayaran
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Metode:</td>
                <td style="padding: 8px 0;">${orderData.payment.method}${orderData.payment.provider ? ` via ${orderData.payment.provider}` : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0;"><span style="background-color: #fbbf24; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">MENUNGGU PEMBAYARAN</span></td>
              </tr>
            </table>
          </div>

          <!-- Action Required -->
          <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #dc2626; display: flex; align-items: center;">
              ⚠️ TINDAKAN DIPERLUKAN
            </h2>
            <ul style="color: #dc2626; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Periksa dan konfirmasi ketersediaan bahan untuk ukuran ${orderData.productConfig.width}×${orderData.productConfig.height}cm</li>
              <li style="margin-bottom: 8px;">Pantau status pembayaran di admin panel</li>
              <li style="margin-bottom: 8px;">Siapkan proses produksi setelah pembayaran dikonfirmasi</li>
              <li style="margin-bottom: 8px;">Hubungi customer jika ada pertanyaan: <a href="tel:${orderData.customer.phone}">${orderData.customer.phone}</a></li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div style="background: #e0f2fe; border: 2px solid #0284c7; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #0284c7; display: flex; align-items: center;">
              🔗 Link Cepat Admin
            </h2>
            <p style="margin: 10px 0;">
              <a href="https://floodbar.id/admin/orders" style="background-color: #0284c7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Kelola Pesanan</a>
              <a href="mailto:${orderData.customer.email}?subject=Regarding Your FloodBar Order ${orderId}" style="background-color: #059669; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Email Customer</a>
            </p>
          </div>
        </div>

        <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0; font-weight: bold;">FloodBar Admin Notification System</p>
          <p style="margin: 5px 0; font-size: 12px;">Notifikasi otomatis untuk pesanan baru</p>
        </div>
      </div>
    `

    // Get email settings from database
    let emailSettings
    try {
      const settingsResult = await prisma.$queryRawUnsafe(`
        SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
      `) as any[]

      console.log('Payment settings query result:', settingsResult.length > 0 ? 'Found settings' : 'No settings found')
      
      if (settingsResult.length && settingsResult[0].isEmailEnabled) {
        emailSettings = {
          gmailUser: settingsResult[0].gmailUser,
          gmailAppPassword: settingsResult[0].gmailAppPassword,
          emailFrom: settingsResult[0].emailFrom || 'FloodBar Admin',
          isEnabled: true
        }
        console.log('Email settings loaded:', {
          gmailUser: settingsResult[0].gmailUser,
          hasPassword: !!settingsResult[0].gmailAppPassword,
          emailFrom: emailSettings.emailFrom,
          isEnabled: true
        })
      } else {
        emailSettings = { isEnabled: false }
        console.log('Email notifications disabled or not configured')
      }
    } catch (dbError) {
      console.log('Could not load email settings from database:', dbError instanceof Error ? dbError.message : dbError)
      emailSettings = { isEnabled: false }
    }

    // Send email to admin
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
          to: adminEmail,
          subject: `🚨 PESANAN BARU MASUK - FloodBar Order ${orderId}`,
          html: emailContent
        })

        console.log('Admin email sent successfully:', info.messageId, 'to:', adminEmail)

        return NextResponse.json({
          success: true,
          message: 'Admin email notification sent successfully',
          messageId: info.messageId,
          adminEmail: adminEmail
        })

      } catch (emailError) {
        console.error('SMTP Error for admin email:', emailError)
        
        // Fallback - log email content
        console.log('Admin email would be sent to:', adminEmail)
        console.log('Subject: 🚨 PESANAN BARU MASUK - FloodBar Order', orderId)
        
        return NextResponse.json({
          success: true,
          message: 'Admin email logged (SMTP error)',
          fallback: true,
          adminEmail: adminEmail
        })
      }
    } else {
      // Fallback - log email content when email not enabled
      console.log('Email notifications disabled or not configured')
      console.log('Admin email would be sent to:', adminEmail)
      console.log('Subject: 🚨 PESANAN BARU MASUK - FloodBar Order', orderId)
      
      return NextResponse.json({
        success: true,
        message: 'Admin email logged (SMTP not enabled)',
        fallback: true,
        adminEmail: adminEmail
      })
    }

  } catch (error) {
    console.error('Error sending admin email notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send admin email notification' },
      { status: 500 }
    )
  }
}