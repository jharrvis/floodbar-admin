import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CalculationRequest {
  width: number  // cm
  height: number // cm
  includePickup?: boolean
  includeInsurance?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { width, height, includePickup = false, includeInsurance = false }: CalculationRequest = await request.json()

    if (!width || !height) {
      return NextResponse.json(
        { success: false, error: 'Lebar dan tinggi wajib diisi' },
        { status: 400 }
      )
    }

    // Get product configuration
    const configResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM product_config ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    if (!configResult || configResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Konfigurasi produk tidak ditemukan' },
        { status: 500 }
      )
    }

    const config = configResult[0]
    
    // Calculate base price based on height
    const pricePerCm = height < 60 
      ? Number(config.priceUnder60cm) 
      : Number(config.priceOver60cm)
    
    // New formula: width x height x pricePerCm
    const basePrice = width * height * pricePerCm

    // Calculate weight (W x H x L x weight constant)
    const packingThickness = Number(config.packingThickness) // L (cm)
    const weightConstant = Number(config.weightConstant)
    const calculatedWeight = width * height * packingThickness * weightConstant
    
    // Apply minimum weight if calculated weight is less than minimum
    const minWeight = Number(config.minShippingWeight)
    const shippingWeight = Math.max(calculatedWeight, minWeight)

    // Additional costs
    let additionalCosts = 0
    const costs = []

    // Packing cost calculation: MAX(width, height) / 100, rounded up, then multiplied by packing cost from database
    const packingCostPerUnit = Number(config.packingCost || 0)
    if (packingCostPerUnit > 0) {
      const maxDimension = Math.max(width, height)
      const packingUnits = Math.ceil(maxDimension / 100) // Round up
      const totalPackingCost = packingUnits * packingCostPerUnit
      additionalCosts += totalPackingCost
      costs.push({ 
        type: 'packing', 
        amount: totalPackingCost, 
        description: `Biaya Packing (${packingUnits} unit × Rp ${packingCostPerUnit.toLocaleString()})` 
      })
    }

    if (includePickup) {
      const pickupCost = Number(config.pickupCost)
      additionalCosts += pickupCost
      costs.push({ type: 'pickup', amount: pickupCost, description: 'Biaya Pickup' })
    }

    if (includeInsurance) {
      const insuranceCost = Number(config.insuranceCost)
      additionalCosts += insuranceCost
      costs.push({ type: 'insurance', amount: insuranceCost, description: 'Biaya Asuransi' })
    }

    const totalPrice = basePrice + additionalCosts

    const calculation = {
      dimensions: {
        width,
        height,
        packingThickness: Number(config.packingThickness)
      },
      pricing: {
        pricePerCm,
        basePrice,
        additionalCosts,
        totalPrice
      },
      shipping: {
        calculatedWeight: Number(calculatedWeight.toFixed(2)),
        minWeight,
        finalWeight: Number(shippingWeight.toFixed(2))
      },
      costs,
      config: {
        priceUnder60cm: Number(config.priceUnder60cm),
        priceOver60cm: Number(config.priceOver60cm),
        weightConstant: Number(config.weightConstant)
      }
    }

    return NextResponse.json({ success: true, data: calculation })
  } catch (error) {
    console.error('Error calculating price:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}