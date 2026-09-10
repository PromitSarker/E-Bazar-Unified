'use client'

import { useState, useEffect } from 'react'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatBDT, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-5">My Orders</h1>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{order.shop?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.items.length} item(s) · {formatBDT(order.total)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <span className="text-xs text-gray-400">{order.type}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
