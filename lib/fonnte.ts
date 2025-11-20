// Fonnte WhatsApp API Service
// Documentation: https://docs.fonnte.com/

interface FonnteResponse {
  status: boolean
  detail?: string
  id?: number[]
  process?: string
  reason?: string
}

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
  orderSummary: {
    subtotal: number
    shippingCost: number
    grandTotal: number
  }
}

// Admin phone numbers for notifications
const ADMIN_PHONES = ['089504656116', '085326483431']

// Send WhatsApp message via Fonnte API
export async function sendWhatsAppMessage(target: string, message: string): Promise<FonnteResponse> {
  const token = process.env.FONNTE_TOKEN

  if (!token) {
    console.error('FONNTE_TOKEN not configured')
    return { status: false, reason: 'FONNTE_TOKEN not configured' }
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: '62'
      })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending Fonnte message:', error)
    return { status: false, reason: 'Network error' }
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

// Send notification to customer when order is created
export async function sendOrderCreatedToCustomer(orderId: string, orderData: OrderData): Promise<FonnteResponse> {
  const message = `*FloodBar - Pesanan Baru*

Halo ${orderData.customer.name},

Terima kasih telah memesan di FloodBar.id!

*Detail Pesanan:*
No. Order: ${orderId}
Produk: FloodBar ${orderData.productConfig.model || 'Custom'}
Ukuran: ${orderData.productConfig.width} x ${orderData.productConfig.height} cm
Tebal: ${orderData.productConfig.thickness} mm
Jumlah: ${orderData.productConfig.quantity} unit
Finishing: ${orderData.productConfig.finish}

*Pengiriman:*
Tujuan: ${orderData.customer.city}
Layanan: ${orderData.shipping.service}

*Rincian Biaya:*
Subtotal: ${formatCurrency(orderData.orderSummary.subtotal)}
Ongkir: ${formatCurrency(orderData.orderSummary.shippingCost)}
*Total: ${formatCurrency(orderData.orderSummary.grandTotal)}*

Silakan selesaikan pembayaran Anda untuk memproses pesanan.

Cek status pesanan: https://floodbar.id/order-status?orderId=${orderId}

Terima kasih!
FloodBar.id`

  return sendWhatsAppMessage(orderData.customer.phone, message)
}

// Send notification to admin when new order is created
export async function sendOrderCreatedToAdmin(orderId: string, orderData: OrderData): Promise<void> {
  const message = `*[ADMIN] Pesanan Baru!*

No. Order: ${orderId}

*Data Pelanggan:*
Nama: ${orderData.customer.name}
HP: ${orderData.customer.phone}
Email: ${orderData.customer.email}
Alamat: ${orderData.customer.address}
Kota: ${orderData.customer.city} ${orderData.customer.postalCode}

*Detail Produk:*
Model: FloodBar ${orderData.productConfig.model || 'Custom'}
Ukuran: ${orderData.productConfig.width} x ${orderData.productConfig.height} cm
Tebal: ${orderData.productConfig.thickness} mm
Qty: ${orderData.productConfig.quantity} unit
Finishing: ${orderData.productConfig.finish}

*Pengiriman:*
Dari: ${orderData.shipping.origin}
Ke: ${orderData.shipping.destination}
Layanan: ${orderData.shipping.service}
Ongkir: ${formatCurrency(orderData.shipping.cost)}

*Total Pembayaran:*
Subtotal: ${formatCurrency(orderData.orderSummary.subtotal)}
Ongkir: ${formatCurrency(orderData.orderSummary.shippingCost)}
*Grand Total: ${formatCurrency(orderData.orderSummary.grandTotal)}*

Status: Menunggu Pembayaran`

  // Send to all admin phones
  for (const phone of ADMIN_PHONES) {
    try {
      await sendWhatsAppMessage(phone, message)
      console.log(`Admin notification sent to ${phone}`)
    } catch (error) {
      console.error(`Failed to send admin notification to ${phone}:`, error)
    }
  }
}

// Send notification when payment is successful
export async function sendPaymentSuccessToCustomer(orderId: string, orderData: OrderData): Promise<FonnteResponse> {
  const message = `*FloodBar - Pembayaran Berhasil*

Halo ${orderData.customer.name},

Pembayaran Anda telah kami terima!

*Detail Pesanan:*
No. Order: ${orderId}
Produk: FloodBar ${orderData.productConfig.model || 'Custom'}
Ukuran: ${orderData.productConfig.width} x ${orderData.productConfig.height} cm
Jumlah: ${orderData.productConfig.quantity} unit

*Total Dibayar: ${formatCurrency(orderData.orderSummary.grandTotal)}*

Pesanan Anda sedang diproses dan akan segera diproduksi.

Estimasi waktu produksi: 5-7 hari kerja

Kami akan mengirimkan notifikasi setelah pesanan dikirim.

Cek status: https://floodbar.id/order-status?orderId=${orderId}

Terima kasih telah berbelanja di FloodBar.id!`

  return sendWhatsAppMessage(orderData.customer.phone, message)
}

// Send notification to admin when payment is successful
export async function sendPaymentSuccessToAdmin(orderId: string, orderData: OrderData): Promise<void> {
  const message = `*[ADMIN] Pembayaran Diterima!*

No. Order: ${orderId}
Pelanggan: ${orderData.customer.name}
HP: ${orderData.customer.phone}

*Produk:*
FloodBar ${orderData.productConfig.model || 'Custom'}
${orderData.productConfig.width} x ${orderData.productConfig.height} cm
Qty: ${orderData.productConfig.quantity}

*Total: ${formatCurrency(orderData.orderSummary.grandTotal)}*

Status: LUNAS - Siap Produksi

Segera proses pesanan ini!`

  // Send to all admin phones
  for (const phone of ADMIN_PHONES) {
    try {
      await sendWhatsAppMessage(phone, message)
      console.log(`Payment success notification sent to admin ${phone}`)
    } catch (error) {
      console.error(`Failed to send payment notification to admin ${phone}:`, error)
    }
  }
}

// Send notification when order is shipped
export async function sendShippedToCustomer(
  orderId: string,
  customerPhone: string,
  customerName: string,
  trackingNumber: string,
  courier: string
): Promise<FonnteResponse> {
  const message = `*FloodBar - Pesanan Dikirim!*

Halo ${customerName},

Pesanan Anda sudah dikirim!

*Detail Pengiriman:*
No. Order: ${orderId}
Kurir: ${courier}
No. Resi: ${trackingNumber}

Silakan lacak pesanan Anda dengan nomor resi di atas.

Estimasi tiba: 2-5 hari kerja (tergantung lokasi)

Cek status: https://floodbar.id/order-status?orderId=${orderId}

Terima kasih telah berbelanja di FloodBar.id!`

  return sendWhatsAppMessage(customerPhone, message)
}
