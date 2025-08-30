import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const config = await prisma.$queryRawUnsafe(`
      SELECT * FROM product_config ORDER BY createdAt DESC LIMIT 1
    `)

    if (Array.isArray(config) && config.length > 0) {
      const productConfig = config[0] as any
      
      // Convert Decimal fields to numbers
      const formattedConfig = {
        id: productConfig.id,
        priceUnder60cm: Number(productConfig.priceUnder60cm),
        priceOver60cm: Number(productConfig.priceOver60cm),
        packingThickness: Number(productConfig.packingThickness),
        weightConstant: Number(productConfig.weightConstant),
        minShippingWeight: Number(productConfig.minShippingWeight),
        pickupCost: Number(productConfig.pickupCost),
        insuranceCost: Number(productConfig.insuranceCost),
        warehouseName: productConfig.warehouseName,
        warehouseAddress: productConfig.warehouseAddress,
        warehouseCity: productConfig.warehouseCity,
        warehouseProvince: productConfig.warehouseProvince,
        warehousePostalCode: productConfig.warehousePostalCode,
        warehousePhone: productConfig.warehousePhone,
        createdAt: productConfig.createdAt,
        updatedAt: productConfig.updatedAt
      }
      
      return NextResponse.json(formattedConfig)
    } else {
      // Return default config if none exists
      const defaultConfig = {
        id: null,
        priceUnder60cm: 170.00,
        priceOver60cm: 120.00,
        packingThickness: 10.00,
        weightConstant: 0.0002,
        minShippingWeight: 10.00,
        pickupCost: 0.00,
        insuranceCost: 0.00,
        warehouseName: 'Gudang Utama',
        warehouseAddress: '',
        warehouseCity: '',
        warehouseProvince: '',
        warehousePostalCode: '',
        warehousePhone: ''
      }
      return NextResponse.json(defaultConfig)
    }
  } catch (error) {
    console.error('Error fetching product config:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.priceUnder60cm || !data.priceOver60cm) {
      return NextResponse.json(
        { success: false, error: 'Harga produk wajib diisi' },
        { status: 400 }
      )
    }

    // Check if config exists
    const existingConfig = await prisma.$queryRawUnsafe(`
      SELECT id FROM product_config LIMIT 1
    `) as any[]

    const configData = {
      priceUnder60cm: parseFloat(data.priceUnder60cm),
      priceOver60cm: parseFloat(data.priceOver60cm),
      packingThickness: parseFloat(data.packingThickness || 10),
      weightConstant: parseFloat(data.weightConstant || 0.0002),
      minShippingWeight: parseFloat(data.minShippingWeight || 10),
      pickupCost: parseFloat(data.pickupCost || 0),
      insuranceCost: parseFloat(data.insuranceCost || 0),
      warehouseName: data.warehouseName || 'Gudang Utama',
      warehouseAddress: data.warehouseAddress || '',
      warehouseCity: data.warehouseCity || '',
      warehouseProvince: data.warehouseProvince || '',
      warehousePostalCode: data.warehousePostalCode || '',
      warehousePhone: data.warehousePhone || ''
    }

    if (existingConfig && existingConfig.length > 0) {
      // Update existing config
      await prisma.$executeRawUnsafe(`
        UPDATE product_config 
        SET priceUnder60cm = ?, priceOver60cm = ?, packingThickness = ?, 
            weightConstant = ?, minShippingWeight = ?, pickupCost = ?, 
            insuranceCost = ?, warehouseName = ?, warehouseAddress = ?, 
            warehouseCity = ?, warehouseProvince = ?, warehousePostalCode = ?, 
            warehousePhone = ?, updatedAt = NOW()
        WHERE id = ?
      `, 
        configData.priceUnder60cm, configData.priceOver60cm, configData.packingThickness,
        configData.weightConstant, configData.minShippingWeight, configData.pickupCost,
        configData.insuranceCost, configData.warehouseName, configData.warehouseAddress,
        configData.warehouseCity, configData.warehouseProvince, configData.warehousePostalCode,
        configData.warehousePhone, existingConfig[0].id
      )
    } else {
      // Create new config
      await prisma.$executeRawUnsafe(`
        INSERT INTO product_config (
          id, priceUnder60cm, priceOver60cm, packingThickness, 
          weightConstant, minShippingWeight, pickupCost, insuranceCost,
          warehouseName, warehouseAddress, warehouseCity, warehouseProvince,
          warehousePostalCode, warehousePhone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'config-' + Date.now(),
        configData.priceUnder60cm, configData.priceOver60cm, configData.packingThickness,
        configData.weightConstant, configData.minShippingWeight, configData.pickupCost,
        configData.insuranceCost, configData.warehouseName, configData.warehouseAddress,
        configData.warehouseCity, configData.warehouseProvince, configData.warehousePostalCode,
        configData.warehousePhone
      )
    }

    return NextResponse.json({ success: true, data: configData })
  } catch (error) {
    console.error('Error updating product config:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}