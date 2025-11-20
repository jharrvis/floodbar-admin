import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { target, message } = await request.json()

    if (!target || !message) {
      return NextResponse.json(
        { success: false, error: 'Target dan message wajib diisi' },
        { status: 400 }
      )
    }

    const token = process.env.FONNTE_TOKEN

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'FONNTE_TOKEN tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    // Send WhatsApp message via Fonnte API
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

    if (result.status) {
      return NextResponse.json({
        success: true,
        message: 'Pesan WhatsApp berhasil dikirim',
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.reason || 'Gagal mengirim pesan',
        data: result
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error sending Fonnte message:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// GET endpoint untuk info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Fonnte WhatsApp API Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        target: 'Nomor HP penerima (contoh: 081234567890)',
        message: 'Isi pesan WhatsApp'
      },
      example: {
        target: '081234567890',
        message: 'Halo, ini pesan test dari FloodBar!'
      }
    }
  })
}
