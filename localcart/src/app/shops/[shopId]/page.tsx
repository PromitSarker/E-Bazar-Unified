'use client'

import { useState, useEffect, use } from 'react'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Spinner, SkeletonCard } from '@/components/ui/Spinner'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { formatBDT } from '@/lib/utils'
import Image from 'next/image'

interface Item {
  id: string
  name: string
  unit: string
  price: number
  stockQty: number
  inStock: boolean
  photoUrl: string | null
  category: { name: string } | null
}

interface Shop {
  id: string
  name: string
  address: string
  phone: string
  deliveryRadiusKm: number
  deliveryFee: number
  minOrderAmount: number
  ratingAvg: number
  ratingCount: number
  isOpen: boolean
  category: { name: string } | null
  operatingHours: Record<string, { open: string; close: string; closed?: boolean }> | null
}

export default function ShopDetailPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params)
  const [shop, setShop] = useState<Shop | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItem, shopId: cartShopId } = useCartStore()
  const { showToast } = useToast()

  useEffect(() => {
    Promise.all([
      fetch(`/api/shops/${shopId}`).then(r => r.json()),
      fetch(`/api/shops/${shopId}/items?inStock=false`).then(r => r.json()),
    ]).then(([shopData, itemData]) => {
      setShop(shopData.shop)
      setItems(itemData.items ?? [])
      const initQty: Record<string, number> = {}
      itemData.items?.forEach((item: Item) => { initQty[item.id] = 1 })
      setQuantities(initQty)
      setLoading(false)
    })
  }, [shopId])

  const handleAddToCart = (item: Item) => {
    if (cartShopId && cartShopId !== shopId) {
      if (!confirm('Adding from a different shop will clear your current cart. Continue?')) return
    }
    addItem(shopId, shop?.name ?? '', {
      itemId: item.id,
      name: item.name,
      unit: item.unit,
      price: item.price,
      quantity: quantities[item.id] ?? 1,
      photoUrl: item.photoUrl,
      inStock: item.inStock,
      stockQty: item.stockQty,
    })
    showToast(`${item.name} added to cart`, 'success')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <SkeletonCard />
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </main>
      </div>
    )
  }

  if (!shop) return <div className="p-8 text-center text-gray-400">Shop not found.</div>

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()]
  const todayHours = shop.operatingHours?.[dayKey]

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="max-w-2xl mx-auto px-4 pb-24">
        {/* Shop header */}
        <div className="bg-white border-b border-gray-200 px-4 py-5 mb-4 -mx-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900">{shop.name}</h1>
                {shop.isOpen ? <Badge variant="success">Open</Badge> : <Badge variant="danger">Closed</Badge>}
              </div>
              {shop.category && <p className="text-xs text-gray-500 mt-0.5">{shop.category.name}</p>}
              <p className="text-xs text-gray-500 mt-0.5">{shop.address}</p>
            </div>
            {shop.ratingAvg > 0 && (
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-gray-900">⭐ {shop.ratingAvg.toFixed(1)}</div>
                <div className="text-xs text-gray-400">{shop.ratingCount} reviews</div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span>🛵 Delivery: {shop.deliveryFee === 0 ? 'Free' : formatBDT(shop.deliveryFee)}</span>
            <span>📍 Within {shop.deliveryRadiusKm}km</span>
            {shop.minOrderAmount > 0 && <span>Min: {formatBDT(shop.minOrderAmount)}</span>}
            {todayHours && !todayHours.closed && (
              <span>🕐 {todayHours.open}–{todayHours.close}</span>
            )}
          </div>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No items listed yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 ${!item.inStock ? 'opacity-50' : ''}`}
              >
                {item.photoUrl ? (
                  <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xl">🛒</div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatBDT(item.price)}</p>
                  {!item.inStock && <Badge variant="danger" className="mt-1">Out of stock</Badge>}
                </div>

                {item.inStock && (
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <QuantityStepper
                      value={quantities[item.id] ?? 1}
                      min={1}
                      max={item.stockQty}
                      onChange={q => setQuantities(prev => ({ ...prev, [item.id]: q }))}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
