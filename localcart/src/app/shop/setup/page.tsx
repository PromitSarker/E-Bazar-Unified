'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { ShopNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), { ssr: false })

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const CATEGORIES_INIT: any[] = []

export default function ShopSetupPage() {
  const [shopId, setShopId] = useState('')
  const [shopData, setShopData] = useState<any>(null)
  const [lat, setLat] = useState<number>(23.8103)
  const [lng, setLng] = useState<number>(90.4125)
  const [address, setAddress] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>()

  useEffect(() => {
    Promise.all([
      fetch('/api/shop/stats').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([stats, catData]) => {
      setCategories(catData.categories ?? [])
      if (!stats.shopId) return
      setShopId(stats.shopId)

      fetch(`/api/shops/${stats.shopId}`).then(r => r.json()).then(d => {
        const shop = d.shop
        setShopData(shop)
        setLat(shop.latitude)
        setLng(shop.longitude)
        setAddress(shop.address)
        reset({
          name: shop.name,
          phone: shop.phone,
          categoryId: shop.categoryId ?? '',
          deliveryRadiusKm: shop.deliveryRadiusKm,
          deliveryFee: shop.deliveryFee,
          minOrderAmount: shop.minOrderAmount,
        })
      })
    })
  }, [reset])

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          latitude: lat,
          longitude: lng,
          address,
          deliveryRadiusKm: parseFloat(data.deliveryRadiusKm),
          deliveryFee: parseFloat(data.deliveryFee),
          minOrderAmount: parseFloat(data.minOrderAmount),
          categoryId: data.categoryId || null,
        }),
      })
      if (res.ok) showToast('Shop settings saved!', 'success')
    } finally {
      setSaving(false)
    }
  }

  if (!shopData) return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">Shop Settings</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Basic info</p>
            <Input label="Shop name" {...register('name', { required: 'Required' })} error={errors.name?.message as string} />
            <Input label="Phone" {...register('phone', { required: 'Required' })} error={errors.phone?.message as string} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <select {...register('categoryId')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Shop location</p>
            <LocationPicker
              initialLat={lat}
              initialLng={lng}
              onLocationChange={(newLat, newLng, addr) => {
                setLat(newLat)
                setLng(newLng)
                if (addr) setAddress(addr)
              }}
            />
          </div>

          {/* Delivery settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Delivery settings</p>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Radius (km)" type="number" step="0.5" {...register('deliveryRadiusKm')} />
              <Input label="Delivery fee (৳)" type="number" step="0.5" {...register('deliveryFee')} />
              <Input label="Min order (৳)" type="number" step="0.5" {...register('minOrderAmount')} />
            </div>
          </div>

          <Button type="submit" fullWidth loading={saving}>Save settings</Button>
        </form>
      </main>
    </div>
  )
}
