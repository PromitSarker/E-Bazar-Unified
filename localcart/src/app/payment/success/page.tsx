'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const sp = useSearchParams()
  const orderId = sp.get('orderId')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-sm text-gray-500 mb-6">Your order has been placed and the shop has been notified.</p>
        {orderId && (
          <Link href={`/orders/${orderId}`} className="block bg-emerald-600 text-white py-3 px-6 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors mb-3">
            Track your order
          </Link>
        )}
        <Link href="/shops" className="text-sm text-emerald-600 hover:underline">Continue shopping</Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
