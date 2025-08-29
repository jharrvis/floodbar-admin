import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const search = searchParams.get('search') || ''
    
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: any[] = []
    
    if (search) {
      whereClause = 'WHERE tujuan LIKE ? OR asal LIKE ? OR via LIKE ?'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    // Use raw SQL with proper BigInt handling
    const [rates, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT id, idHarga, kodeJasa, cakupan, via, tipe, 
               CAST(hargaOnline AS CHAR) as hargaOnline, 
               CAST(hargaPks AS CHAR) as hargaPks, 
               asal, tujuan, wilayah, updateDate, jenis, varian, leadTime, 
               kodeNegara, simbol, 
               CAST(nilaiTukar AS CHAR) as nilaiTukar, 
               diskon
        FROM shipping_rates 
        ${whereClause}
        ORDER BY tujuan ASC 
        LIMIT ? OFFSET ?
      `, ...params, limit, offset),
      
      prisma.$queryRawUnsafe(`
        SELECT CAST(COUNT(*) AS CHAR) as count FROM shipping_rates ${whereClause}
      `, ...params)
    ]) as [any[], any[]]

    const total = parseInt(totalResult[0]?.count || '0')

    return NextResponse.json({
      success: true,
      data: rates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID diperlukan' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!data.tujuan) {
      return NextResponse.json(
        { success: false, error: 'Tujuan diperlukan' },
        { status: 400 }
      )
    }

    // Update the record
    await prisma.$executeRawUnsafe(`
      UPDATE shipping_rates SET
        idHarga = ?, kodeJasa = ?, cakupan = ?, via = ?, tipe = ?,
        hargaOnline = ?, hargaPks = ?, asal = ?, tujuan = ?, wilayah = ?,
        updateDate = ?, jenis = ?, varian = ?, leadTime = ?,
        kodeNegara = ?, simbol = ?, nilaiTukar = ?, diskon = ?,
        updatedAt = NOW()
      WHERE id = ?
    `,
      data.idHarga || null,
      data.kodeJasa || null,
      data.cakupan || null,
      data.via || null,
      data.tipe || null,
      data.hargaOnline ? parseFloat(data.hargaOnline) : null,
      data.hargaPks ? parseFloat(data.hargaPks) : null,
      data.asal || null,
      data.tujuan,
      data.wilayah || null,
      data.updateDate || null,
      data.jenis || null,
      data.varian || null,
      data.leadTime || null,
      data.kodeNegara || null,
      data.simbol || null,
      data.nilaiTukar ? parseFloat(data.nilaiTukar) : null,
      data.diskon || null,
      id
    )

    return NextResponse.json({
      success: true,
      message: 'Data berhasil diupdate'
    })
  } catch (error) {
    console.error('Error updating shipping rate:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'clear') {
      await prisma.$executeRawUnsafe('DELETE FROM shipping_rates')
      return NextResponse.json({ success: true, message: 'Semua data shipping rates berhasil dihapus' })
    }

    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID diperlukan' },
        { status: 400 }
      )
    }

    await prisma.$executeRawUnsafe('DELETE FROM shipping_rates WHERE id = ?', id)
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting shipping rates:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}