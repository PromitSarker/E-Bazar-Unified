'use client'

import { useState, useEffect, useRef } from 'react'
import { ShopNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { formatBDT, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'

const ORDER_STATUSES = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']

const NEXT_STATUS: Record<string, string> = {
  ACCEPTED: 'PREPARING',
  PREPARING: '', // branching: delivery vs pickup
  OUT_FOR_DELIVERY: 'COMPLETED',
  READY_FOR_PICKUP: 'COMPLETED',
}

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PLACED')
  const [selected, setSelected] = useState<any>(null)
  const [shopId, setShopId] = useState<string>('')
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const { showToast } = useToast()
  const prevCountRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Beep on new orders
  const playBeep = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      osc.connect(ctx.destination)
      osc.frequency.value = 880
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {}
  }

  const fetchOrders = async () => {
    const statsRes = await fetch('/api/shop/stats')
    const statsData = await statsRes.json()
    if (statsData.shopId) setShopId(statsData.shopId)

    const res = await fetch(`/api/orders?status=${filter}`)
    const data = await res.json()
    const newOrders = data.orders ?? []

    // Notify on new placed orders
    if (filter === 'PLACED' && newOrders.length > prevCountRef.current) {
      playBeep()
    }
    prevCountRef.current = newOrders.length
    setOrders(newOrders)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchOrders()
    const interval = setInterval(fetchOrders, 7000)
    return () => clearInterval(interval)
  }, [filter])

  const updateStatus = async (orderId: string, status: string, reason?: string) => {
    setProcessing(true)
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(reason ? { rejectionReason: reason } : {}) }),
    })
    setProcessing(false)
    if (res.ok) {
      showToast(`Order ${getOrderStatusLabel(status)}`, 'success')
      setSelected(null)
      fetchOrders()
    } else {
      const d = await res.json()
      showToast(d.error ?? 'Update failed', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Orders</h1>

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {getOrderStatusLabel(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No {getOrderStatusLabel(filter).toLowerCase()} orders.</div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.items.length} item(s) · {formatBDT(order.total)} · {order.type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order — ${selected?.customer?.name}`} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              {selected.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.itemNameSnapshot} × {item.quantity}</span>
                  <span>{formatBDT(item.lineTotal)}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span><span>{formatBDT(selected.total)}</span>
              </div>
            </div>

            {selected.deliveryAddress && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">📍 {selected.deliveryAddress}</p>
            )}

            {selected.pickupSlot && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                🕐 Pickup: {selected.pickupSlot.startTime} – {selected.pickupSlot.endTime}
              </p>
            )}

            {selected.notes && <p className="text-xs text-gray-500">Note: {selected.notes}</p>}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selected.status === 'PLACED' && (
                <>
                  <Button size="sm" onClick={() => updateStatus(selected.id, 'ACCEPTED')} loading={processing}>Accept</Button>
                  <div className="flex gap-2 items-end flex-1">
                    <input
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                    />
                    <Button size="sm" variant="danger" onClick={() => updateStatus(selected.id, 'CANCELLED', rejectReason)} loading={processing}>
                      Reject
                    </Button>
                  </div>
                </>
              )}
              {selected.status === 'ACCEPTED' && (
                <Button size="sm" onClick={() => updateStatus(selected.id, 'PREPARING')} loading={processing}>Mark Preparing</Button>
              )}
              {selected.status === 'PREPARING' && selected.type === 'DELIVERY' && (
                <Button size="sm" onClick={() => updateStatus(selected.id, 'OUT_FOR_DELIVERY')} loading={processing}>Out for Delivery</Button>
              )}
              {selected.status === 'PREPARING' && selected.type === 'PICKUP' && (
                <Button size="sm" onClick={() => updateStatus(selected.id, 'READY_FOR_PICKUP')} loading={processing}>Ready for Pickup</Button>
              )}
              {(selected.status === 'OUT_FOR_DELIVERY' || selected.status === 'READY_FOR_PICKUP') && (
                <Button size="sm" onClick={() => updateStatus(selected.id, 'COMPLETED')} loading={processing}>Mark Completed</Button>
              )}
              {!['COMPLETED', 'CANCELLED'].includes(selected.status) && (
                <Button size="sm" variant="danger" onClick={() => updateStatus(selected.id, 'CANCELLED')} loading={processing}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
