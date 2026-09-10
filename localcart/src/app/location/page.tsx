'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), { ssr: false })

export default function LocationPage() {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [address, setAddress] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<{ latitude: number; longitude: number } | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/customer/location')
      .then(r => r.json())
      .then(d => {
        if (d.profile?.latitude) {
          setExisting({ latitude: d.profile.latitude, longitude: d.profile.longitude })
          setLat(d.profile.latitude)
          setLng(d.profile.longitude)
          setAddress(d.profile.defaultAddress ?? '')
        }
      })
  }, [])

  const handleSave = async () => {
    if (!lat || !lng) {
      showToast('Please pin your location on the map', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/customer/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, defaultAddress: address }),
      })
      if (res.ok) {
        showToast('Location saved!', 'success')
        router.push('/shops')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Set your delivery address</h1>
            <p className="text-sm text-gray-500 mt-1">We use this to show shops that can deliver to you.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
            <LocationPicker
              initialLat={existing?.latitude}
              initialLng={existing?.longitude}
              onLocationChange={(newLat, newLng, addr) => {
                setLat(newLat)
                setLng(newLng)
                if (addr) setAddress(addr)
              }}
            />
            <Button fullWidth onClick={handleSave} loading={saving} disabled={!lat}>
              Save location & find shops
            </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
