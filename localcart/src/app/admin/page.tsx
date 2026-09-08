'use client'

import { useState, useEffect } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { StatCard } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatBDT } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Approved shops" value={stats?.totalShops ?? 0} color="emerald" />
          <StatCard label="Pending approvals" value={stats?.pendingShops ?? 0} color="yellow" />
          <StatCard label="Customers" value={stats?.totalCustomers ?? 0} color="blue" />
          <StatCard label="Total orders" value={stats?.totalOrders ?? 0} color="purple" />
          <StatCard label="Completed orders" value={stats?.completedOrders ?? 0} color="emerald" />
          <StatCard label="Cancelled orders" value={stats?.cancelledOrders ?? 0} color="red" />
          <StatCard label="Total GMV" value={formatBDT(stats?.gmv ?? 0)} color="emerald" />
          <StatCard label="Today's GMV" value={formatBDT(stats?.todayGMV ?? 0)} color="blue" />
        </div>

        {stats?.pendingShops > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-yellow-800 font-medium">
              {stats.pendingShops} shop{stats.pendingShops > 1 ? 's' : ''} awaiting approval
            </p>
            <Link href="/admin/approvals" className="text-sm text-yellow-700 underline font-medium">Review →</Link>
          </div>
        )}
      </main>
    </div>
  )
}
