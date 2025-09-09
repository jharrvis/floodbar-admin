import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { cloudName, apiKey, apiSecret } = await request.json()

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing required credentials' },
        { status: 400 }
      )
    }

    // Test Cloudinary connection by making a simple API call
    const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Cloudinary connection successful' 
      })
    } else {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ 
        success: false, 
        error: errorData.error?.message || 'Invalid credentials or connection failed' 
      })
    }
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error)
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    )
  }
}