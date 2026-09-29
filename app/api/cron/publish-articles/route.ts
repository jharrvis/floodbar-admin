import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (!secret || authorization !== 'Bearer ' + secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const result = await prisma.article.updateMany({
    where: { isPublished: false, scheduledAt: { lte: now } },
    data: { isPublished: true, publishedAt: now, scheduledAt: null }
  })

  return NextResponse.json({ success: true, published: result.count, executedAt: now.toISOString() })
}
