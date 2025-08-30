import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WhatsAppData {
  to: string
  orderId: string
  orderData: any
}

export async function POST(request: NextRequest) {
  try {
    const { to, orderId, orderData }: WhatsAppData = await request.json()

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Format phone number (remove leading 0 and add 62)
    const formatPhoneNumber = (phone: string) => {
      let cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1)
      } else if (!cleanPhone.startsWith('62')) {
        cleanPhone = '62' + cleanPhone
      }
      return cleanPhone
    }

    const formattedPhone = formatPhoneNumber(to)

    // Create WhatsApp message
    const message = `🧱 *FLOODBAR INVOICE*
━━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderId}

👤 *CUSTOMER INFO*
Nama: ${orderData.customer.name}
Email: ${orderData.customer.email}
Telepon: ${orderData.customer.phone}
Alamat: ${orderData.customer.address}, ${orderData.customer.city} ${orderData.customer.postalCode}

📦 *SPESIFIKASI PRODUK*
Ukuran: ${orderData.productConfig.width}cm x ${orderData.productConfig.height}cm
Ketebalan: ${orderData.productConfig.thickness}mm
Jumlah: ${orderData.productConfig.quantity} pcs
Finishing: ${orderData.productConfig.finish}

🚚 *PENGIRIMAN*
Asal: ${orderData.shipping.origin}
Tujuan: ${orderData.shipping.destination}
Layanan: ${orderData.shipping.service}
Berat: ${orderData.shipping.weight}kg

💰 *RINGKASAN PEMBAYARAN*
Subtotal: ${formatCurrency(orderData.orderSummary.subtotal)}
Ongkir: ${formatCurrency(orderData.orderSummary.shippingCost)}
Biaya Admin: ${formatCurrency(orderData.orderSummary.adminFee)}
━━━━━━━━━━━━━━━━━━━━━
*TOTAL: ${formatCurrency(orderData.orderSummary.grandTotal)}*

💳 *Metode Pembayaran:* ${orderData.payment.method}${orderData.payment.provider ? ` via ${orderData.payment.provider}` : ''}

⚠️ Silakan lakukan pembayaran sesuai metode yang dipilih. Tim kami akan menghubungi Anda setelah pembayaran dikonfirmasi.

Terima kasih telah mempercayai FloodBar! 🙏`

    // Here you would integrate with WhatsApp Business API
    // For now, we'll just log the message
    console.log('WhatsApp message would be sent to:', formattedPhone)
    console.log('WhatsApp message:', message)

    // In production, you would use:
    // - WhatsApp Business API
    // - Twilio WhatsApp API
    // - Or other WhatsApp gateway services

    // Example integration with WhatsApp Business API:
    /*
    const whatsappApiUrl = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
    
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const result = await response.json()
    */

    return NextResponse.json({
      success: true,
      message: 'WhatsApp notification sent successfully',
      phone: formattedPhone
    })

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send WhatsApp notification' },
      { status: 500 }
    )
  }
}