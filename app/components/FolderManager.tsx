'use client'

import { useState, useEffect } from 'react'
import { Plus, Folder, FolderPlus, Trash2, Edit3, ChevronRight, ChevronDown } from 'lucide-react'

interface CloudinaryFolder {
  name: string
  path: string
  subfolders?: CloudinaryFolder[]
}

interface FolderManagerProps {
  currentFolder: string
  onFolderChange: (folderPath: string) => void
  onFoldersUpdate?: () => void
}

export default function FolderManager({ currentFolder, onFolderChange, onFoldersUpdate }: FolderManagerProps) {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedParentFolder, setSelectedParentFolder] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media/folders')
      const data = await response.json()
      if (data.success) {
        setFolders(data.folders)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: newFolderName,
          parentFolder: selectedParentFolder
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setNewFolderName('')
        setSelectedParentFolder('')
        setShowCreateDialog(false)
        fetchFolders()
        if (onFoldersUpdate) onFoldersUpdate()
      } else {
        alert(data.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder')
    } finally {
      setIsCreating(false)
    }
  }

  const deleteFolder = async (folderPath: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus folder "${folderPath}" dan semua isinya?`)) return
    
    try {
      const response = await fetch('/api/media/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchFolders()
        if (onFoldersUpdate) onFoldersUpdate()
        if (currentFolder === folderPath) {
          onFolderChange('') // Reset to all folders
        }
      } else {
        alert(data.error || 'Failed to delete folder')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder')
    }
  }

  const toggleFolderExpansion = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: CloudinaryFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.path)
    const isSelected = currentFolder === folder.path
    const hasSubfolders = folder.subfolders && folder.subfolders.length > 0

    return (
      <div key={folder.path}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100 text-blue-700' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasSubfolders && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpansion(folder.path)
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          <Folder size={16} className={hasSubfolders ? '' : 'ml-6'} />
          
          <span
            className="flex-1"
            onClick={() => onFolderChange(folder.path)}
          >
            {folder.name}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteFolder(folder.path)
            }}
            className="p-1 hover:bg-red-100 hover:text-red-600 rounded opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {hasSubfolders && isExpanded && (
          <div>
            {folder.subfolders!.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const getFolderOptions = () => {
    const options: { value: string; label: string }[] = [{ value: '', label: 'Root Folder' }]
    
    const addFolderOptions = (folderList: CloudinaryFolder[], prefix: string = '') => {
      folderList.forEach(folder => {
        options.push({
          value: folder.path,
          label: prefix + folder.name
        })
        
        if (folder.subfolders && folder.subfolders.length > 0) {
          addFolderOptions(folder.subfolders, prefix + folder.name + '/')
        }
      })
    }
    
    addFolderOptions(folders)
    return options
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Folder Management</h3>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <FolderPlus size={16} />
            New Folder
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFolderChange('')}
            className={`px-3 py-1 rounded text-sm ${
              currentFolder === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Folders
          </button>
          <button
            onClick={fetchFolders}
            disabled={loading}
            className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="p-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No folders found</div>
        ) : (
          <div className="space-y-1 group">
            {folders.map(folder => renderFolder(folder))}
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Folder (Optional)
                </label>
                <select
                  value={selectedParentFolder}
                  onChange={(e) => setSelectedParentFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getFolderOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim() || isCreating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Folder'}
              </button>
              <button
                onClick={() => {
                  setShowCreateDialog(false)
                  setNewFolderName('')
                  setSelectedParentFolder('')
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}