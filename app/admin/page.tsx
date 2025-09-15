'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, ShoppingCart, AlertCircle, TrendingUp, DollarSign } from 'lucide-react'
import SalesChart from './components/SalesChart'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerPostalCode: string
  productModel?: string
  productWidth: number
  productHeight: number
  productThickness: number
  productQuantity: number
  productFinish: string
  shippingOrigin: string
  shippingDestination: string
  shippingWeight: number
  shippingService: string
  shippingCost: number
  paymentMethod: string
  paymentProvider: string
  subtotal: number
  adminFee: number
  grandTotal: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.orders) {
          setOrders(data.orders)
          
          // Calculate stats
          const totalRevenue = data.orders.reduce((sum: number, order: Order) => sum + order.grandTotal, 0)
          const pendingOrders = data.orders.filter((order: Order) => order.status === 'pending').length
          
          setStats({
            totalOrders: data.orders.length,
            totalRevenue,
            pendingOrders
          })
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const dashboardStats = [
    {
      name: 'Total Pesanan',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Pesanan Pending',
      value: stats.pendingOrders.toString(),
      icon: AlertCircle,
      change: '-5%',
      changeType: stats.pendingOrders > 0 ? 'negative' : 'positive'
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard FloodBar</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {dashboardStats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">
                          {item.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span
                    className={`font-medium ${
                      item.changeType === 'positive'
                        ? 'text-green-600'
                        : item.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.change}
                  </span>
                  <span className="text-gray-500"> dari bulan lalu</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.grandTotal)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">Tidak ada data pesanan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}