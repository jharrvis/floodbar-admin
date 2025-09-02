import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get recent webhook logs for debugging
    const webhookLogs = await prisma.$queryRawUnsafe(`
      SELECT * FROM webhook_logs 
      ORDER BY processedAt DESC 
      LIMIT 20
    `) as any[]

    // Get payment settings for webhook configuration
    const settingsResult = await prisma.$queryRawUnsafe(`
      SELECT xenditWebhookToken, isXenditEnabled FROM payment_settings ORDER BY createdAt DESC LIMIT 1
    `) as any[]

    const settings = settingsResult.length > 0 ? settingsResult[0] : null

    return NextResponse.json({
      success: true,
      webhookLogs,
      settings: {
        webhookTokenConfigured: !!settings?.xenditWebhookToken,
        xenditEnabled: !!settings?.isXenditEnabled,
        webhookUrl: process.env.NODE_ENV === 'production' ? 'https://floodbar.id/api/webhooks/xendit' : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/xendit`
      }
    })
  } catch (error) {
    console.error('Error fetching webhook debug info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debug info' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Test webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    console.log('🧪 Test webhook received:', body)
    
    // Log test webhook for debugging
    await prisma.$queryRawUnsafe(`
      INSERT INTO webhook_logs (
        id, orderId, provider, eventType, status, webhookData, processedAt
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, 
      'test-webhook-' + Date.now(),
      'TEST',
      'test',
      'test_webhook',
      'received',
      body
    )

    return NextResponse.json({
      success: true,
      message: 'Test webhook received and logged'
    })
  } catch (error) {
    console.error('Error processing test webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process test webhook' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}