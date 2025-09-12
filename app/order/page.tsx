import { Suspense } from 'react'
import OrderPageClient from '@/components/OrderPageClient'

function OrderPageFallback() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}


export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageFallback />}>
      <OrderPageClient />
    </Suspense>
  )
}