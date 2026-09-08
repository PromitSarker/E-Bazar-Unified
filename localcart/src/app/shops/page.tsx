'use client'

import { useState, useEffect, useCallback } from 'react'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatBDT, formatDistance } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ShopWithDistance {
  id: string
  name: string
  address: string
  distanceKm: number
  deliveryRadiusKm: number
  deliveryFee: number
  ratingAvg: number
  ratingCount: number
  isOpen: boolean
  category: { name: string } | null
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [noLocation, setNoLocation] = useState(false)
  const router = useRouter()

  const fetchShops = useCallback(async () => {
    // Get customer location
    const locRes = await fetch('/api/customer/location')
    const locData = await locRes.json()
    if (!locData.profile?.latitude) {
      setNoLocation(true)
      setLoading(false)
      return
    }
    const { latitude: lat, longitude: lng } = locData.profile

    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() })
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    const res = await fetch(`/api/shops/nearby?${params}`)
    const data = await res.json()
    setShops(data.shops ?? [])
    setLoading(false)
  }, [search, category])

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(fetchShops, 300)
    return () => clearTimeout(t)
  }, [fetchShops])

  if (noLocation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-sm mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Set your location first to see shops near you.</p>
          <Link href="/location" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
            Set location
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search + filter */}
        <div className="flex gap-2 mb-4">
          <input
            type="search"
            placeholder="Search shops…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : shops.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No shops found nearby. Try expanding your search.
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map(shop => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-gray-900 text-sm">{shop.name}</h2>
                        {!shop.isOpen && <Badge variant="danger">Closed</Badge>}
                        {shop.category && <Badge>{shop.category.name}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{shop.address}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>📍 {formatDistance(shop.distanceKm)}</span>
                        {shop.ratingAvg > 0 && (
                          <span>⭐ {shop.ratingAvg.toFixed(1)} ({shop.ratingCount})</span>
                        )}
                        {shop.deliveryFee === 0 ? (
                          <Badge variant="success">Free delivery</Badge>
                        ) : (
                          <span>🛵 {formatBDT(shop.deliveryFee)}</span>
                        )}
                        {shop.distanceKm > shop.deliveryRadiusKm && (
                          <Badge variant="warning">Pickup only</Badge>
                        )}
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
