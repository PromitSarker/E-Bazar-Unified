'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { Spinner } from '@/components/ui/Spinner'
import { getOrderStatusColor, getOrderStatusLabel, getPaymentStatusLabel, formatBDT, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [payFilter, setPayFilter] = useState('')

  const fetchOrders = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (payFilter) params.set('paymentStatus', payFilter)
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false) })
  }, [search, statusFilter, payFilter])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(fetchOrders, 300)
    return () => clearTimeout(t)
  }, [fetchOrders])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="search"
            placeholder="Search by ID, customer, shop…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
            <option value="">All statuses</option>
            {['PLACED','ACCEPTED','PREPARING','OUT_FOR_DELIVERY','READY_FOR_PICKUP','COMPLETED','CANCELLED'].map(s => (
              <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
            ))}
          </select>
          <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
            <option value="">All payments</option>
            {['UNPAID','PAID','FAILED','COD'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Shop</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-700">{order.customer?.name}</td>
                    <td className="px-4 py-3 text-gray-700">{order.shop?.name}</td>
                    <td className="px-4 py-3 font-medium">{formatBDT(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{getPaymentStatusLabel(order.paymentStatus)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
