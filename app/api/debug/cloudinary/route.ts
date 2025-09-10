import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== CLOUDINARY DEBUG START ===')
    
    // Check environment variables
    const envVars = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    }
    
    console.log('Environment variables:', {
      cloudName: envVars.cloudName || 'NOT SET',
      apiKey: envVars.apiKey ? 'SET' : 'NOT SET',
      apiSecret: envVars.apiSecret ? 'SET' : 'NOT SET',
      uploadPreset: envVars.uploadPreset || 'NOT SET'
    })

    if (!envVars.cloudName || !envVars.apiKey || !envVars.apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        envStatus: {
          cloudName: envVars.cloudName ? 'SET' : 'NOT SET',
          apiKey: envVars.apiKey ? 'SET' : 'NOT SET',
          apiSecret: envVars.apiSecret ? 'SET' : 'NOT SET'
        }
      })
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: envVars.cloudName,
      api_key: envVars.apiKey,
      api_secret: envVars.apiSecret,
    })

    console.log('Cloudinary configured, testing connection...')

    // Test with direct API call
    const testUrl = `https://api.cloudinary.com/v1_1/${envVars.cloudName}/resources/image`
    const auth = Buffer.from(`${envVars.apiKey}:${envVars.apiSecret}`).toString('base64')

    console.log('Making direct API call to:', testUrl)

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Direct API response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('Direct API success, resources:', data.resources?.length || 0)
      
      // Also test Cloudinary SDK
      try {
        const sdkResult = await cloudinary.api.resources({
          resource_type: 'image',
          type: 'upload',
          max_results: 10
        })
        
        console.log('SDK test success, resources:', sdkResult.resources?.length || 0)
        
        return NextResponse.json({
          success: true,
          message: 'Cloudinary connection successful',
          directAPI: {
            status: response.status,
            resourceCount: data.resources?.length || 0
          },
          sdk: {
            resourceCount: sdkResult.resources?.length || 0
          }
        })
      } catch (sdkError) {
        console.error('SDK test failed:', sdkError)
        return NextResponse.json({
          success: true,
          message: 'Direct API works but SDK failed',
          directAPI: {
            status: response.status,
            resourceCount: data.resources?.length || 0
          },
          sdkError: sdkError instanceof Error ? sdkError.message : String(sdkError)
        })
      }
    } else {
      const errorData = await response.text()
      console.error('Direct API failed:', response.status, errorData)
      return NextResponse.json({
        success: false,
        error: `Direct API failed: ${response.status}`,
        responseText: errorData
      })
    }
  } catch (error) {
    console.error('Cloudinary debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug test failed: ' + (error instanceof Error ? error.message : String(error))
    })
  }
}