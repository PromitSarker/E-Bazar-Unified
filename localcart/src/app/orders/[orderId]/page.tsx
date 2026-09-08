'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { StatusTimeline } from '@/components/ui/StatusTimeline'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'
import { formatBDT, formatDate, getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/utils'

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()

  const fetchOrder = () => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setLoading(false) })
  }

  useEffect(() => {
    fetchOrder()
    // Poll every 8s if order is active
    const interval = setInterval(() => {
      if (order && ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(order.status)) {
        fetchOrder()
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [orderId, order?.status])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    setCancelling(false)
    if (res.ok) {
      showToast('Order cancelled', 'info')
      fetchOrder()
    } else {
      const d = await res.json()
      showToast(d.error ?? 'Cannot cancel', 'error')
    }
  }

  const handleReview = async () => {
    setSubmittingReview(true)
    const res = await fetch(`/api/orders/${orderId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    })
    setSubmittingReview(false)
    if (res.ok) {
      showToast('Review submitted!', 'success')
      fetchOrder()
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </div>
  )

  if (!order) return <div className="p-8 text-center text-gray-400">Order not found.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div>
          <button onClick={() => router.back()} className="text-sm text-emerald-600 mb-3 flex items-center gap-1 hover:underline">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Order from {order.shop?.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.type}</p>
        </div>

        {/* Status timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">Order status</p>
          <StatusTimeline orderType={order.type} currentStatus={order.status} />

          {order.status === 'PLACED' && user?.role === 'CUSTOMER' && (
            <Button variant="danger" size="sm" className="mt-4" onClick={handleCancel} loading={cancelling}>
              Cancel order
            </Button>
          )}
          {order.rejectionReason && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Reason: {order.rejectionReason}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.itemNameSnapshot} × {item.quantity}</span>
              <span className="text-gray-900">{formatBDT(item.lineTotal)}</span>
            </div>
          ))}
          <hr className="border-gray-100" />
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delivery fee</span><span>{formatBDT(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span><span>{formatBDT(order.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-1">
            <span>Payment</span><span>{getPaymentStatusLabel(order.paymentStatus)}</span>
          </div>
        </div>

        {/* Pickup slot info */}
        {order.pickupSlot && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700">Pickup slot</p>
            <p className="text-sm text-gray-600 mt-1">{order.pickupSlot.startTime} – {order.pickupSlot.endTime}</p>
          </div>
        )}

        {/* Review */}
        {order.status === 'COMPLETED' && !order.review && user?.role === 'CUSTOMER' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Leave a review</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`text-2xl transition-transform ${s <= rating ? 'scale-110' : 'opacity-30'}`}>⭐</button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="Optional comment…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <Button size="sm" onClick={handleReview} loading={submittingReview}>Submit review</Button>
          </div>
        )}

        {order.review && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
            <p className="text-sm font-medium text-emerald-800">Your review: {'⭐'.repeat(order.review.rating)}</p>
            {order.review.comment && <p className="text-xs text-emerald-700 mt-1">{order.review.comment}</p>}
          </div>
        )}
      </main>
    </div>
  )
}
