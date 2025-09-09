'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  Package,
  Truck,
  CreditCard,
  ShoppingBag,
  Image,
  LogOut 
} from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: Home
  },
  {
    label: 'Landing Page',
    href: '/admin/landing',
    icon: FileText
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: Image
  },
  {
    label: 'Produk & Pengiriman',
    href: '/admin/product',
    icon: Package
  },
  {
    label: 'Ongkir Indah Cargo',
    href: '/admin/shipping',
    icon: Truck
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users
  },
  {
    label: 'Kelola Pesanan',
    href: '/admin/orders',
    icon: ShoppingBag
  },
  {
    label: 'Pengaturan Pembayaran',
    href: '/admin/payment',
    icon: CreditCard
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

interface Order {
  id: string
  createdAt: string
  status: string
  paymentStatus: string
  isChecked?: boolean
}

export default function Sidebar() {
  const pathname = usePathname()
  const [unreadOrdersCount, setUnreadOrdersCount] = useState(0)

  // Load orders data to get unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/orders')
        const result = await response.json()
        
        if (result.success) {
          const uncheckedCount = result.orders.filter((order: Order) => 
            !order.isChecked
          ).length
          setUnreadOrdersCount(uncheckedCount)
        }
      } catch (error) {
        console.error('Error loading unread orders count:', error)
      }
    }

    loadUnreadCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)

    // Listen for real-time updates from orders page
    const handleOrderCheckedChange = (event: CustomEvent) => {
      setUnreadOrdersCount(event.detail.uncheckedCount)
    }

    window.addEventListener('orderCheckedStatusChanged', handleOrderCheckedChange as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('orderCheckedStatusChanged', handleOrderCheckedChange as EventListener)
    }
  }, [])

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Floodbar Admin</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.href === '/admin/orders' && unreadOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse">
                  {unreadOrdersCount > 99 ? '99+' : unreadOrdersCount}
                </span>
              )}
            </Link>
          )
        })}
        
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}