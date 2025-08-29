import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: "mysql://generator_floodbar:3%28%3B8I%29ZA9bYy%25NP%3F@167.172.88.142:3306/generator_floodbar"
})

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function parseDecimal(value: string): number | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File CSV diperlukan' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File CSV kosong atau tidak valid' },
        { status: 400 }
      )
    }

    const header = parseCSVLine(lines[0])
    console.log('CSV Header:', header)

    let processed = 0
    let updated = 0
    let added = 0
    let errors = 0

    // Process in batches to avoid memory issues
    const batchSize = 100
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize)
      
      for (const line of batch) {
        try {
          const columns = parseCSVLine(line)
          
          // Skip empty lines or lines with insufficient data
          if (columns.length < 9 || !columns[8]?.trim()) {
            continue
          }

          const data = {
            idHarga: columns[0] || null,
            kodeJasa: columns[1] || null,
            cakupan: columns[2] || null,
            via: columns[3] || null,
            tipe: columns[4] || null,
            hargaOnline: parseDecimal(columns[5]),
            hargaPks: parseDecimal(columns[6]),
            asal: columns[7] || null,
            tujuan: columns[8].trim(),
            wilayah: columns[9] || null,
            updateDate: columns[10] || null,
            jenis: columns[11] || null,
            varian: columns[12] || null,
            leadTime: columns[13] || null,
            kodeNegara: columns[14] || null,
            simbol: columns[15] || null,
            nilaiTukar: parseDecimal(columns[16]),
            diskon: columns[17] || null
          }

          // Check if record exists
          const existing = await prisma.$queryRawUnsafe(`
            SELECT id FROM shipping_rates 
            WHERE asal = ? AND tujuan = ? AND via = ?
          `, data.asal || '', data.tujuan, data.via || '') as any[]

          if (existing.length > 0) {
            // Update existing record
            await prisma.$executeRawUnsafe(`
              UPDATE shipping_rates SET
                idHarga = ?, kodeJasa = ?, cakupan = ?, via = ?, tipe = ?,
                hargaOnline = ?, hargaPks = ?, asal = ?, wilayah = ?,
                updateDate = ?, jenis = ?, varian = ?, leadTime = ?,
                kodeNegara = ?, simbol = ?, nilaiTukar = ?, diskon = ?,
                updatedAt = NOW()
              WHERE id = ?
            `,
              data.idHarga, data.kodeJasa, data.cakupan, data.via, data.tipe,
              data.hargaOnline, data.hargaPks, data.asal, data.wilayah,
              data.updateDate, data.jenis, data.varian, data.leadTime,
              data.kodeNegara, data.simbol, data.nilaiTukar, data.diskon,
              existing[0].id
            )
            updated++
          } else {
            // Insert new record
            await prisma.$executeRawUnsafe(`
              INSERT INTO shipping_rates (
                id, idHarga, kodeJasa, cakupan, via, tipe,
                hargaOnline, hargaPks, asal, tujuan, wilayah,
                updateDate, jenis, varian, leadTime,
                kodeNegara, simbol, nilaiTukar, diskon
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
              'rate-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              data.idHarga, data.kodeJasa, data.cakupan, data.via, data.tipe,
              data.hargaOnline, data.hargaPks, data.asal, data.tujuan, data.wilayah,
              data.updateDate, data.jenis, data.varian, data.leadTime,
              data.kodeNegara, data.simbol, data.nilaiTukar, data.diskon
            )
            added++
          }
          
          processed++
        } catch (error) {
          console.error('Error processing line:', error)
          errors++
        }
      }
      
      // Progress logging
      if (i % (batchSize * 10) === 1) {
        console.log(`Processed ${Math.min(i + batchSize, lines.length - 1)} of ${lines.length - 1} lines`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Upload selesai! ${processed} data diproses, ${added} ditambahkan, ${updated} diupdate, ${errors} error.`,
      stats: {
        processed,
        added,
        updated,
        errors,
        total: lines.length - 1
      }
    })

  } catch (error) {
    console.error('Error uploading CSV:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server: ' + error },
      { status: 500 }
    )
  }
}