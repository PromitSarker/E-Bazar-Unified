'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { getShopStatusColor, formatDate } from '@/lib/utils'

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const { showToast } = useToast()

  const fetchShops = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/admin/shops?${params}`)
      .then(r => r.json())
      .then(d => { setShops(d.shops ?? []); setLoading(false) })
  }, [search, statusFilter])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(fetchShops, 300)
    return () => clearTimeout(t)
  }, [fetchShops])

  const updateStatus = async (shopId: string, status: string) => {
    setProcessing(shopId)
    const res = await fetch(`/api/admin/shops/${shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setProcessing(null)
    if (res.ok) { showToast('Status updated', 'success'); fetchShops() }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Shops</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="search"
            placeholder="Search shops…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Shop</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map(shop => (
                  <tr key={shop.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{shop.name}</p>
                      <p className="text-xs text-gray-400">{shop.address}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 text-xs">
                      <p>{shop.owner?.name}</p>
                      <p>{shop.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getShopStatusColor(shop.status)}`}>
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {shop.status === 'APPROVED' ? (
                        <Button size="sm" variant="outline" loading={processing === shop.id} onClick={() => updateStatus(shop.id, 'SUSPENDED')}>Suspend</Button>
                      ) : shop.status === 'SUSPENDED' ? (
                        <Button size="sm" loading={processing === shop.id} onClick={() => updateStatus(shop.id, 'APPROVED')}>Reactivate</Button>
                      ) : (
                        <Button size="sm" loading={processing === shop.id} onClick={() => updateStatus(shop.id, 'APPROVED')}>Approve</Button>
                      )}
                    </td>
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
