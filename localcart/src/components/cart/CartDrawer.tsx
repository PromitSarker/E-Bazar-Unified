'use client'

import * as React from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatBDT } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, shopName, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore()
  const router = useRouter()

  if (!open) return null

  const subtotal = getSubtotal()

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-sm flex flex-col h-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Your Cart</h2>
            {shopName && <p className="text-xs text-gray-500 mt-0.5">{shopName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.itemId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatBDT(item.price)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <QuantityStepper
                    value={item.quantity}
                    min={1}
                    max={item.stockQty}
                    onChange={(q) => updateQuantity(item.itemId, q)}
                    size="sm"
                  />
                  <button
                    onClick={() => removeItem(item.itemId)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatBDT(subtotal)}</span>
            </div>
            <Button
              fullWidth
              onClick={() => { onClose(); router.push('/checkout') }}
            >
              Proceed to Checkout
            </Button>
            <button
              onClick={() => clearCart()}
              className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
