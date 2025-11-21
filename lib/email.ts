// Email notification service
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface OrderData {
  productConfig: {
    model?: string
    width: number
    height: number
    thickness: number
    quantity: number
    finish: string
  }
  shipping: {
    origin: string
    destination: string
    weight: number
    service: string
    cost: number
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  payment: {
    method: string
    provider?: string
  }
  orderSummary: {
    subtotal: number
    shippingCost: number
    adminFee?: number
    grandTotal: number
  }
}

// Format currency to IDR
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Get email settings from database
async function getEmailSettings() {
  try {
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length && settingsResult[0].isEmailEnabled) {
      return {
        gmailUser: settingsResult[0].gmailUser,
        gmailAppPassword: settingsResult[0].gmailAppPassword,
        emailFrom: settingsResult[0].emailFrom || 'FloodBar',
        isEnabled: true
      }
    }
  } catch (error) {
    console.error('Could not load email settings:', error)
  }

  return { isEnabled: false }
}

// Get admin email from settings
async function getAdminEmail(): Promise<string> {
  try {
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT adminEmail FROM settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (settingsResult.length > 0 && settingsResult[0].adminEmail) {
      return settingsResult[0].adminEmail
    }
  } catch (error) {
    console.error('Could not load admin email:', error)
  }

  return 'admin@floodbar.id' // fallback
}

// Send email to customer when order is created
export async function sendOrderEmailToCustomer(orderId: string, orderData: OrderData): Promise<boolean> {
  const emailSettings = await getEmailSettings()

  if (!emailSettings.isEnabled || !emailSettings.gmailUser || !emailSettings.gmailAppPassword) {
    console.log('Email notifications disabled or not configured')
    return false
  }

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
        </div>

        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #374151;">Ringkasan Pembayaran</h3>
          <p>Subtotal Produk: ${formatCurrency(orderData.orderSummary.subtotal)}</p>
          <p>Ongkos Kirim: ${formatCurrency(orderData.orderSummary.shippingCost)}</p>
          <hr style="margin: 15px 0;">
          <p style="font-weight: bold; font-size: 18px; color: #1e40af;">
            Total Pembayaran: ${formatCurrency(orderData.orderSummary.grandTotal)}
          </p>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #92400e;">Instruksi Pembayaran</h3>
          <p style="margin-bottom: 0; color: #92400e;">
            Silakan lakukan pembayaran sesuai metode yang dipilih: <strong>${orderData.payment.method}</strong>.
            Tim kami akan menghubungi Anda setelah pembayaran dikonfirmasi.
          </p>
        </div>
      </div>

      <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
        <p style="margin: 0;">Terima kasih telah mempercayai FloodBar!</p>
      </div>
    </div>
  `

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailSettings.gmailUser,
        pass: emailSettings.gmailAppPassword
      }
    })

    const info = await transporter.sendMail({
      from: `"${emailSettings.emailFrom}" <${emailSettings.gmailUser}>`,
      to: orderData.customer.email,
      subject: `Invoice FloodBar - Order ${orderId}`,
      html: emailContent
    })

    console.log('Customer email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send customer email:', error)
    return false
  }
}

// Send email to admin when new order is created
export async function sendOrderEmailToAdmin(orderId: string, orderData: OrderData): Promise<boolean> {
  const emailSettings = await getEmailSettings()
  const adminEmail = await getAdminEmail()

  if (!emailSettings.isEnabled || !emailSettings.gmailUser || !emailSettings.gmailAppPassword) {
    console.log('Email notifications disabled or not configured')
    return false
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🚨 PESANAN BARU MASUK</h1>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">Order ID: ${orderId}</p>
        <p style="margin: 5px 0; font-size: 14px;">Diterima pada: ${formatDate()}</p>
      </div>

      <div style="padding: 20px; background-color: #f9fafb;">
        <!-- Customer Info -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <h2 style="margin-top: 0; color: #1e40af;">👤 Informasi Customer</h2>
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
              <td style="padding: 8px 0; font-weight: bold;">Alamat:</td>
              <td style="padding: 8px 0;">${orderData.customer.address}, ${orderData.customer.city} ${orderData.customer.postalCode}</td>
            </tr>
          </table>
        </div>

        <!-- Product Info -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
          <h2 style="margin-top: 0; color: #059669;">📦 Spesifikasi Produk</h2>
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
          <h2 style="margin-top: 0; color: #7c3aed;">🚚 Informasi Pengiriman</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Tujuan:</td>
              <td style="padding: 8px 0;">${orderData.shipping.destination}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Layanan:</td>
              <td style="padding: 8px 0;">${orderData.shipping.service}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Ongkir:</td>
              <td style="padding: 8px 0;"><strong>${formatCurrency(orderData.orderSummary.shippingCost)}</strong></td>
            </tr>
          </table>
        </div>

        <!-- Payment Summary -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <h2 style="margin-top: 0; color: #f59e0b;">💰 Rincian Pembayaran</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 60%;">Subtotal Produk:</td>
              <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Ongkos Kirim:</td>
              <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.orderSummary.shippingCost)}</td>
            </tr>
            <tr style="border-top: 3px solid #f59e0b; background-color: #fef3c7;">
              <td style="padding: 15px 0; font-weight: bold; font-size: 18px; color: #92400e;">TOTAL:</td>
              <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #92400e;">${formatCurrency(orderData.orderSummary.grandTotal)}</td>
            </tr>
          </table>
        </div>

        <!-- Action Required -->
        <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px;">
          <h2 style="margin-top: 0; color: #dc2626;">⚠️ TINDAKAN DIPERLUKAN</h2>
          <ul style="color: #dc2626; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Pantau status pembayaran di admin panel</li>
            <li style="margin-bottom: 8px;">Siapkan proses produksi setelah pembayaran dikonfirmasi</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
        <p style="margin: 0; font-weight: bold;">FloodBar Admin Notification</p>
      </div>
    </div>
  `

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailSettings.gmailUser,
        pass: emailSettings.gmailAppPassword
      }
    })

    const info = await transporter.sendMail({
      from: `"${emailSettings.emailFrom}" <${emailSettings.gmailUser}>`,
      to: adminEmail,
      subject: `🚨 PESANAN BARU - FloodBar Order ${orderId}`,
      html: emailContent
    })

    console.log('Admin email sent to', adminEmail, ':', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send admin email:', error)
    return false
  }
}
