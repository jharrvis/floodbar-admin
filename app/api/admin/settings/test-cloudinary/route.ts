import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { cloudName, apiKey, apiSecret } = body

    // Use environment variables as primary source if frontend doesn't provide them
    cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    apiKey = apiKey || process.env.CLOUDINARY_API_KEY  
    apiSecret = apiSecret || process.env.CLOUDINARY_API_SECRET

    console.log('Testing Cloudinary with:', {
      cloudName: cloudName || 'NOT SET',
      apiKey: apiKey ? 'SET' : 'NOT SET',
      apiSecret: apiSecret ? 'SET' : 'NOT SET'
    })

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing required credentials. Please check environment variables or provide credentials.' },
        { status: 400 }
      )
    }

    // Test Cloudinary connection by making a simple API call
    const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

    console.log('Making request to:', testUrl)

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('Connection successful, resources count:', data.resources?.length || 0)
      return NextResponse.json({ 
        success: true, 
        message: `Cloudinary connection successful. Found ${data.resources?.length || 0} resources.` 
      })
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('Connection failed:', errorData)
      return NextResponse.json({ 
        success: false, 
        error: errorData.error?.message || `Invalid credentials or connection failed (${response.status})` 
      })
    }
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error)
    return NextResponse.json(
      { success: false, error: 'Connection test failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}