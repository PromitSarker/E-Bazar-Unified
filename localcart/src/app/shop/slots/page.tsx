'use client'

import { useState, useEffect } from 'react'
import { ShopNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SlotsPage() {
  const [slots, setSlots] = useState<any[]>([])
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { dayOfWeek: 0, startTime: '09:00', endTime: '11:00', maxOrders: 10 },
  })

  const fetchSlots = async () => {
    const statsRes = await fetch('/api/shop/stats')
    const stats = await statsRes.json()
    if (!stats.shopId) return
    setShopId(stats.shopId)
    const res = await fetch(`/api/shops/${stats.shopId}/slots`)
    const data = await res.json()
    setSlots(data.slots ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSlots() }, [])

  const onSubmit = async (data: any) => {
    setSaving(true)
    const res = await fetch(`/api/shops/${shopId}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, dayOfWeek: parseInt(data.dayOfWeek), maxOrders: parseInt(data.maxOrders) }),
    })
    setSaving(false)
    if (res.ok) {
      showToast('Slot added', 'success')
      setAddOpen(false)
      reset()
      fetchSlots()
    }
  }

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return
    await fetch(`/api/shops/${shopId}/slots/${slotId}`, { method: 'DELETE' })
    setSlots(prev => prev.filter(s => s.id !== slotId))
    showToast('Slot deleted', 'info')
  }

  // Group slots by day
  const byDay: Record<number, any[]> = {}
  slots.forEach(s => {
    const d = s.dayOfWeek ?? -1
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(s)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pickup Slots</h1>
            <p className="text-xs text-gray-500 mt-0.5">Customers will see these slots when choosing pickup.</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Add slot</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No pickup slots configured.</div>
        ) : (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5, 6].map(day => {
              const daySlots = byDay[day] ?? []
              if (daySlots.length === 0) return null
              return (
                <div key={day} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">{DAYS[day]}</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {daySlots.map((slot: any) => (
                      <div key={slot.id} className="flex items-center justify-between px-4 py-3">
                        <p className="text-sm text-gray-800">{slot.startTime} – {slot.endTime}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>Max {slot.maxOrders}</span>
                          <button onClick={() => deleteSlot(slot.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add pickup slot">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Day of week</label>
            <select {...register('dayOfWeek')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start time" type="time" {...register('startTime', { required: 'Required' })} error={errors.startTime?.message as string} />
            <Input label="End time" type="time" {...register('endTime', { required: 'Required' })} error={errors.endTime?.message as string} />
          </div>
          <Input label="Max orders" type="number" min={1} {...register('maxOrders')} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add slot</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
