'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerNavbar } from '@/components/layout/Navbar'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'
import { formatBDT } from '@/lib/utils'

interface Slot { id: string; dayOfWeek: number | null; startTime: string; endTime: string }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function CheckoutPage() {
  const { items, shopId, getSubtotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()

  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'SSLCOMMERZ'>('CASH')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null)
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [shopInfo, setShopInfo] = useState<any>(null)
  const [customerProfile, setCustomerProfile] = useState<any>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!shopId) return
    fetch(`/api/shops/${shopId}`).then(r => r.json()).then(d => setShopInfo(d.shop))
    fetch(`/api/shops/${shopId}/slots`).then(r => r.json()).then(d => setSlots(d.slots ?? []))
    fetch('/api/customer/location').then(r => r.json()).then(d => {
      if (d.profile) {
        setCustomerProfile(d.profile)
        setDeliveryAddress(d.profile.defaultAddress ?? '')
        setDeliveryLat(d.profile.latitude)
        setDeliveryLng(d.profile.longitude)
      }
    })
  }, [shopId])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="text-center py-16 text-gray-400 text-sm">
          Your cart is empty. <button onClick={() => router.back()} className="text-emerald-600 underline">Go back</button>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const deliveryFee = orderType === 'DELIVERY' ? (shopInfo?.deliveryFee ?? 0) : 0
  const total = subtotal + deliveryFee

  const todaySlots = slots.filter(s => s.dayOfWeek === new Date().getDay() || s.dayOfWeek === null)

  const handlePlaceOrder = async () => {
    if (orderType === 'DELIVERY' && !deliveryAddress) {
      showToast('Enter delivery address', 'error')
      return
    }
    if (orderType === 'PICKUP' && !selectedSlot) {
      showToast('Select a pickup slot', 'error')
      return
    }

    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          type: orderType,
          paymentMethod,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
          deliveryLat: orderType === 'DELIVERY' ? deliveryLat : undefined,
          deliveryLng: orderType === 'DELIVERY' ? deliveryLng : undefined,
          pickupSlotId: orderType === 'PICKUP' ? selectedSlot : undefined,
          items: items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? 'Order failed', 'error')
        return
      }

      clearCart()

      if (paymentMethod === 'SSLCOMMERZ') {
        // Initiate online payment
        const payRes = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.order.id }),
        })
        const payData = await payRes.json()
        if (payData.gatewayUrl) {
          window.location.href = payData.gatewayUrl
          return
        }
        showToast('Payment initiation failed, order placed as COD', 'info')
      }

      showToast('Order placed!', 'success')
      router.push(`/orders/${data.order.id}`)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

        {/* Order type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Order type</p>
          <div className="flex gap-2">
            {(['DELIVERY', 'PICKUP'] as const).map(t => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                  orderType === t ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'DELIVERY' ? '🛵 Delivery' : '🏪 Pickup'}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {orderType === 'DELIVERY' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Delivery address</p>
            <textarea
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Enter delivery address"
            />
            {deliveryFee > 0 && (
              <p className="text-xs text-gray-500">Delivery fee: {formatBDT(deliveryFee)}</p>
            )}
          </div>
        )}

        {/* Pickup slot */}
        {orderType === 'PICKUP' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Pickup time</p>
            {todaySlots.length === 0 ? (
              <p className="text-xs text-gray-400">No pickup slots available today.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {todaySlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedSlot === slot.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {slot.startTime} – {slot.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Payment</p>
          <div className="space-y-2">
            {[
              { value: 'CASH', label: '💵 Cash on ' + (orderType === 'DELIVERY' ? 'delivery' : 'pickup') },
              { value: 'SSLCOMMERZ', label: '📱 Pay online (bKash, Nagad, card)' },
            ].map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === opt.value ? 'bg-emerald-50 border-emerald-400' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value as 'CASH' | 'SSLCOMMERZ')}
                  className="text-emerald-600"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Order summary</p>
          {items.map(item => (
            <div key={item.itemId} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name} × {item.quantity}</span>
              <span className="text-gray-900">{formatBDT(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr className="border-gray-100" />
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery fee</span>
              <span className="text-gray-900">{formatBDT(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{formatBDT(total)}</span>
          </div>
        </div>

        <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={placing}>
          {paymentMethod === 'SSLCOMMERZ' ? 'Pay & Place Order' : 'Place Order'}
        </Button>
      </main>
    </div>
    </AuthGuard>
  )
}
