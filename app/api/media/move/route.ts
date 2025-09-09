import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST - Move image to different folder
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { publicId, targetFolder } = body

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      )
    }

    if (!targetFolder) {
      return NextResponse.json(
        { success: false, error: 'Target folder is required' },
        { status: 400 }
      )
    }

    console.log('Moving image:', { publicId, targetFolder })

    // Get the original file name (without folder path)
    const originalFileName = publicId.split('/').pop()
    const newPublicId = `${targetFolder}/${originalFileName}`

    console.log('New public ID:', newPublicId)

    // Check if the image is already in the target folder
    if (publicId === newPublicId) {
      return NextResponse.json({
        success: true,
        message: `Image is already in folder '${targetFolder}'`,
        oldPublicId: publicId,
        newPublicId: newPublicId,
        alreadyInFolder: true
      })
    }

    // Check if the current folder path of the image
    const currentFolder = publicId.includes('/') ? publicId.substring(0, publicId.lastIndexOf('/')) : ''
    
    if (currentFolder === targetFolder) {
      return NextResponse.json({
        success: true,
        message: `Image is already in folder '${targetFolder}'`,
        oldPublicId: publicId,
        newPublicId: publicId,
        alreadyInFolder: true
      })
    }

    // Use Cloudinary's rename function to move the image
    const result = await cloudinary.uploader.rename(publicId, newPublicId)

    console.log('Move result:', result)

    return NextResponse.json({
      success: true,
      message: `Image moved from '${currentFolder || 'root'}' to folder '${targetFolder}' successfully`,
      oldPublicId: publicId,
      newPublicId: newPublicId,
      result: result
    })
  } catch (error) {
    console.error('Error moving image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to move image: ' + (error as Error).message },
      { status: 500 }
    )
  }
}