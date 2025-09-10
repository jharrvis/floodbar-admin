import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { configureCloudinary } from '@/lib/cloudinary-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Get all folders from Cloudinary
export async function GET() {
  try {
    // Configure Cloudinary from database
    const configured = await configureCloudinary()
    if (!configured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration not found. Please configure in admin settings.', folders: [] },
        { status: 200 }
      )
    }

    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders()
    
    // Also get subfolders for each root folder
    const foldersWithSubfolders = await Promise.all(
      result.folders.map(async (folder: any) => {
        try {
          const subfolders = await cloudinary.api.sub_folders(folder.path)
          return {
            ...folder,
            subfolders: subfolders.folders || []
          }
        } catch (error) {
          return {
            ...folder,
            subfolders: []
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      folders: foldersWithSubfolders
    })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}

// POST - Create new folder
export async function POST(request: Request) {
  try {
    // Configure Cloudinary from database
    const configured = await configureCloudinary()
    if (!configured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration not found. Please configure in admin settings.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { folderName, parentFolder } = body

    if (!folderName) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 }
      )
    }

    // Create folder by uploading a placeholder image and then deleting it
    const folderPath = parentFolder ? `${parentFolder}/${folderName}` : folderName
    
    // Upload a temporary placeholder to create the folder
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      {
        folder: folderPath,
        public_id: 'temp_folder_creator',
        overwrite: true
      }
    )

    // Delete the placeholder image, keeping the folder
    await cloudinary.uploader.destroy(uploadResult.public_id)

    return NextResponse.json({
      success: true,
      message: `Folder '${folderPath}' created successfully`,
      folderPath: folderPath
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

// DELETE - Delete folder (and all its contents)
export async function DELETE(request: Request) {
  try {
    // Configure Cloudinary from database
    const configured = await configureCloudinary()
    if (!configured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration not found. Please configure in admin settings.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { folderPath } = body

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      )
    }

    console.log('Deleting folder:', folderPath)

    // Helper function to recursively delete all resources in a folder
    const deleteAllResourcesInFolder = async (path: string) => {
      let deletedCount = 0
      let hasMore = true
      let nextCursor: string | undefined

      // Try multiple resource types and strategies
      const resourceTypes = ['upload', 'raw', 'video']
      
      for (const resourceType of resourceTypes) {
        hasMore = true
        nextCursor = undefined
        
        while (hasMore) {
          try {
            // Get resources with prefix to include all resources in folder and subfolders
            const resources = await cloudinary.api.resources({
              type: resourceType,
              prefix: path,
              max_results: 500, // Increased batch size
              next_cursor: nextCursor
            })

            console.log(`Found ${resources.resources?.length || 0} ${resourceType} resources in ${path}`)

            if (resources.resources && resources.resources.length > 0) {
              const publicIds = resources.resources.map((resource: any) => resource.public_id)
              console.log(`Deleting ${resourceType} resources:`, publicIds)
              
              // Delete resources in smaller batches for reliability
              const batchSize = 50
              for (let i = 0; i < publicIds.length; i += batchSize) {
                const batch = publicIds.slice(i, i + batchSize)
                
                try {
                  if (resourceType === 'upload') {
                    await cloudinary.api.delete_resources(batch)
                  } else {
                    await cloudinary.api.delete_resources(batch, { resource_type: resourceType })
                  }
                  deletedCount += batch.length
                  console.log(`Successfully deleted batch of ${batch.length} ${resourceType} resources`)
                } catch (deleteError) {
                  console.error(`Error deleting ${resourceType} batch:`, deleteError)
                  // Try deleting individually if batch fails
                  for (const id of batch) {
                    try {
                      if (resourceType === 'upload') {
                        await cloudinary.uploader.destroy(id)
                      } else {
                        await cloudinary.uploader.destroy(id, { resource_type: resourceType })
                      }
                      deletedCount += 1
                    } catch (individualError) {
                      console.error(`Failed to delete ${resourceType} ${id}:`, individualError)
                    }
                  }
                }
              }
            }

            hasMore = resources.next_cursor != null
            nextCursor = resources.next_cursor
          } catch (resourceError) {
            console.error(`Error getting ${resourceType} resources:`, resourceError)
            break
          }
        }
      }

      // Also try to find resources with exact folder match
      try {
        const exactFolderResources = await cloudinary.api.resources({
          type: 'upload',
          prefix: path + '/',
          max_results: 500
        })
        
        if (exactFolderResources.resources && exactFolderResources.resources.length > 0) {
          console.log(`Found ${exactFolderResources.resources.length} resources with exact folder match`)
          const exactIds = exactFolderResources.resources.map((r: any) => r.public_id)
          
          for (const id of exactIds) {
            try {
              await cloudinary.uploader.destroy(id)
              deletedCount += 1
            } catch (error) {
              console.error(`Failed to delete exact match ${id}:`, error)
            }
          }
        }
      } catch (exactError) {
        console.log('No exact folder resources found:', exactError)
      }

      return deletedCount
    }

    // Helper function to get all subfolders recursively
    const getAllSubfolders = async (path: string): Promise<string[]> => {
      const allFolders: string[] = []
      
      try {
        const subfolders = await cloudinary.api.sub_folders(path)
        
        for (const subfolder of subfolders.folders || []) {
          const subfolderPath = `${path}/${subfolder.name}`
          allFolders.push(subfolderPath)
          
          // Get subfolders of this subfolder
          const nestedFolders = await getAllSubfolders(subfolderPath)
          allFolders.push(...nestedFolders)
        }
      } catch (error) {
        console.log(`No subfolders found in ${path}:`, error)
      }
      
      return allFolders
    }

    // Step 1: Delete all resources (including in subfolders)
    const deletedCount = await deleteAllResourcesInFolder(folderPath)
    console.log(`Deleted ${deletedCount} resources from folder ${folderPath} and its subfolders`)

    // Step 2: Get all subfolders (deepest first)
    const allSubfolders = await getAllSubfolders(folderPath)
    const sortedSubfolders = allSubfolders.sort((a, b) => b.length - a.length) // Deepest first

    // Step 3: Delete all subfolders from deepest to shallowest
    for (const subfolderPath of sortedSubfolders) {
      try {
        console.log('Deleting subfolder:', subfolderPath)
        await cloudinary.api.delete_folder(subfolderPath)
        console.log(`Successfully deleted subfolder: ${subfolderPath}`)
      } catch (subfolderError) {
        console.error(`Error deleting subfolder ${subfolderPath}:`, subfolderError)
        
        // Try alternative cleanup for stubborn subfolders
        try {
          await deleteAllResourcesInFolder(subfolderPath)
          await cloudinary.api.delete_folder(subfolderPath)
        } catch (altError) {
          console.error(`Alternative cleanup failed for ${subfolderPath}:`, altError)
        }
      }
    }

    // Step 4: Final aggressive deletion attempts
    let folderDeleted = false
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        console.log(`Attempting to delete main folder (attempt ${attempt + 1}):`, folderPath)
        await cloudinary.api.delete_folder(folderPath)
        console.log(`Successfully deleted main folder: ${folderPath}`)
        folderDeleted = true
        break
      } catch (folderError) {
        console.error(`Attempt ${attempt + 1} failed:`, folderError)
        
        if (attempt < 4) {
          // Progressive cleanup strategies
          console.log(`Performing cleanup strategy ${attempt + 1}...`)
          
          if (attempt === 0) {
            // Strategy 1: Basic resource cleanup
            await deleteAllResourcesInFolder(folderPath)
          } else if (attempt === 1) {
            // Strategy 2: Try exact folder path variations
            const variations = [
              folderPath,
              folderPath + '/',
              folderPath.toLowerCase(),
              folderPath.toUpperCase()
            ]
            
            for (const variation of variations) {
              try {
                await deleteAllResourcesInFolder(variation)
              } catch (err) {
                console.log(`Variation ${variation} cleanup failed:`, err)
              }
            }
          } else if (attempt === 2) {
            // Strategy 3: Try to delete all resources by prefix search
            try {
              const allResources = await cloudinary.search
                .expression(`folder:${folderPath}`)
                .max_results(500)
                .execute()
              
              if (allResources.resources && allResources.resources.length > 0) {
                console.log(`Found ${allResources.resources.length} resources via search`)
                const searchIds = allResources.resources.map((r: any) => r.public_id)
                
                for (const id of searchIds) {
                  try {
                    await cloudinary.uploader.destroy(id)
                  } catch (err) {
                    console.error(`Failed to destroy searched resource ${id}:`, err)
                  }
                }
              }
            } catch (searchError) {
              console.log('Search strategy failed:', searchError)
            }
          } else if (attempt === 3) {
            // Strategy 4: Try to find any remaining resources with broader search
            try {
              const broadSearch = await cloudinary.api.resources({
                type: 'upload',
                max_results: 500
              })
              
              const folderResources = broadSearch.resources?.filter((r: any) => 
                r.public_id.startsWith(folderPath)
              )
              
              if (folderResources && folderResources.length > 0) {
                console.log(`Found ${folderResources.length} resources in broad search`)
                for (const resource of folderResources) {
                  try {
                    await cloudinary.uploader.destroy(resource.public_id)
                  } catch (err) {
                    console.error(`Failed to destroy broad search resource ${resource.public_id}:`, err)
                  }
                }
              }
            } catch (broadError) {
              console.log('Broad search strategy failed:', broadError)
            }
          }
          
          // Wait between attempts
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    if (!folderDeleted) {
      // Last resort: Return success but with warning
      console.log(`Warning: Could not delete folder '${folderPath}' completely. It may be empty now but Cloudinary still shows it as existing.`)
      return NextResponse.json({
        success: true,
        message: `Folder '${folderPath}' cleanup completed. Resources deleted: ${deletedCount}. Note: Folder structure may still exist in Cloudinary but should be empty.`,
        warning: 'Folder deletion completed with cleanup but folder structure may persist'
      })
    }

    return NextResponse.json({
      success: true,
      message: `Folder '${folderPath}' and ${deletedCount} files deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete folder: ' + (error as Error).message },
      { status: 500 }
    )
  }
}