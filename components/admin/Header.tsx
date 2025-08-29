'use client'

import { useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h2>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {session?.user?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}