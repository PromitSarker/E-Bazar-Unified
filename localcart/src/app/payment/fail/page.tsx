'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function FailContent() {
  const sp = useSearchParams()
  const orderId = sp.get('orderId')
  const reason = sp.get('reason')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment failed</h1>
        <p className="text-sm text-gray-500 mb-6">
          {reason === 'cancelled' ? 'You cancelled the payment.' : 'Something went wrong with your payment.'}
          {' '}Your order has not been charged.
        </p>
        <div className="space-y-3">
          {orderId && (
            <Link href={`/orders/${orderId}`} className="block bg-emerald-600 text-white py-3 px-6 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              View order (pay later or switch to cash)
            </Link>
          )}
          <Link href="/checkout" className="block text-sm text-gray-500 hover:underline">
            Back to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return <Suspense><FailContent /></Suspense>
}
