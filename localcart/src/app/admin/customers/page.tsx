'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const { showToast } = useToast()

  const fetchCustomers = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    fetch(`/api/admin/customers?${params}`)
      .then(r => r.json())
      .then(d => { setCustomers(d.customers ?? []); setLoading(false) })
  }, [search])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(t)
  }, [fetchCustomers])

  const toggleActive = async (userId: string, isActive: boolean) => {
    setProcessing(userId)
    const res = await fetch('/api/admin/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActive }),
    })
    setProcessing(null)
    if (res.ok) { showToast(isActive ? 'Account reactivated' : 'Account suspended', 'success'); fetchCustomers() }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
        <input
          type="search"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Orders</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(c => (
                  <tr key={c.id} className={!c.isActive ? 'opacity-50' : ''}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c._count?.orders ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {c.isActive ? (
                        <Button size="sm" variant="outline" loading={processing === c.id} onClick={() => toggleActive(c.id, false)}>Suspend</Button>
                      ) : (
                        <Button size="sm" loading={processing === c.id} onClick={() => toggleActive(c.id, true)}>Reactivate</Button>
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
