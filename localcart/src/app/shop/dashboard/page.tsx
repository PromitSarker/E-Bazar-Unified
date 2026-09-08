'use client'

import { useState, useEffect } from 'react'
import { ShopNavbar } from '@/components/layout/Navbar'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatBDT } from '@/lib/utils'
import Link from 'next/link'

export default function ShopDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [togglingOpen, setTogglingOpen] = useState(false)

  const fetchStats = () => {
    fetch('/api/shop/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const toggleOpen = async () => {
    if (!stats?.shopId) return
    setTogglingOpen(true)
    await fetch(`/api/shops/${stats.shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: !stats.isOpen }),
    })
    await fetchStats()
    setTogglingOpen(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </div>
  )

  if (stats?.shopStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-lg font-semibold text-gray-900">Awaiting approval</h2>
          <p className="text-sm text-gray-500 mt-2">Your shop registration is under review. You&apos;ll be notified once approved.</p>
          <Link href="/shop/setup" className="inline-block mt-4 text-emerald-600 text-sm hover:underline">Edit shop details</Link>
        </div>
      </div>
    )
  }

  if (stats?.shopStatus === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-lg font-semibold text-gray-900">Shop suspended</h2>
          <p className="text-sm text-gray-500 mt-2">Contact support for more information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Shop header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{stats?.shopName}</h1>
            <Badge variant={stats?.isOpen ? 'success' : 'danger'} className="mt-1">
              {stats?.isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <Button
            variant={stats?.isOpen ? 'outline' : 'primary'}
            size="sm"
            onClick={toggleOpen}
            loading={togglingOpen}
          >
            {stats?.isOpen ? 'Close shop' : 'Open shop'}
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Today's orders" value={stats?.todayOrders ?? 0} icon="📦" color="blue" />
          <StatCard label="Today's revenue" value={formatBDT(stats?.todayRevenue ?? 0)} icon="💰" color="emerald" />
          <StatCard label="Week revenue" value={formatBDT(stats?.weekRevenue ?? 0)} icon="📈" color="purple" />
          <StatCard label="Active orders" value={stats?.activeOrders ?? 0} icon="🔔" color="yellow" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { href: '/shop/orders', label: '📬 Incoming Orders', badge: stats?.activeOrders },
            { href: '/shop/inventory', label: '📦 Inventory' },
            { href: '/shop/slots', label: '🕐 Pickup Slots' },
            { href: '/shop/setup', label: '⚙️ Shop Settings' },
          ].map(link => (
            <Link key={link.href} href={link.href}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 transition-colors cursor-pointer flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Top selling items */}
        {stats?.topItems?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Top selling items (all time)</p>
            <div className="space-y-2">
              {stats.topItems.map((item: any, i: number) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                  <p className="text-sm text-gray-800 flex-1">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.qty} sold</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
