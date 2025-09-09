import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const envStatus = {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'YES' : 'NO',
    }

    // Show actual values for public vars and length for sensitive ones
    const envDetails = {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? `***${process.env.CLOUDINARY_API_KEY.slice(-4)}` : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? `***${process.env.CLOUDINARY_API_SECRET.slice(-4)}` : 'NOT SET',
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'NO',
    }

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      status: envStatus,
      details: envDetails
    })
  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check environment' },
      { status: 500 }
    )
  }
}