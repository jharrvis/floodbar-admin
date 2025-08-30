'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  Package,
  Truck,
  CreditCard,
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

export default function Sidebar() {
  const pathname = usePathname()

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
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
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