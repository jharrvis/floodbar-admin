import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryConfig } from '@/lib/cloudinary-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== CLOUDINARY DEBUG START (Database-Only) ===')
    
    // Get configuration from database
    const config = await getCloudinaryConfig()
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'No Cloudinary configuration found in database',
        dbStatus: 'NO CONFIG'
      })
    }

    console.log('Database configuration found:', {
      cloudName: config.cloudName || 'NOT SET',
      apiKey: config.apiKey ? `SET (length: ${config.apiKey.length})` : 'NOT SET',
      apiSecret: config.apiSecret ? `SET (length: ${config.apiSecret.length})` : 'NOT SET',
      uploadPreset: config.uploadPreset || 'NOT SET'
    })

    // Additional debug: show first/last few characters
    console.log('Debug values:', {
      cloudName: config.cloudName,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 3)}...${config.apiKey.slice(-3)}` : 'NOT SET',
      apiSecret: config.apiSecret ? `${config.apiSecret.substring(0, 3)}...${config.apiSecret.slice(-3)}` : 'NOT SET'
    })

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    })

    console.log('Cloudinary configured, testing connection...')

    // Test with direct API call
    const testUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image`
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')

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