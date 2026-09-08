'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  itemId: string
  name: string
  unit: string
  price: number
  quantity: number
  photoUrl?: string | null
  inStock: boolean
  stockQty: number
}

interface CartState {
  shopId: string | null
  shopName: string | null
  items: CartItem[]
  addItem: (shopId: string, shopName: string, item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      shopId: null,
      shopName: null,
      items: [],

      addItem: (shopId, shopName, item) => {
        const state = get()

        // If adding from a different shop, clear cart first
        if (state.shopId && state.shopId !== shopId) {
          set({ shopId, shopName, items: [{ ...item, quantity: item.quantity || 1 }] })
          return
        }

        const existing = state.items.find(i => i.itemId === item.itemId)
        if (existing) {
          set({
            shopId,
            shopName,
            items: state.items.map(i =>
              i.itemId === item.itemId
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), i.stockQty) }
                : i
            ),
          })
        } else {
          set({
            shopId,
            shopName,
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          })
        }
      },

      removeItem: (itemId) => {
        const state = get()
        const newItems = state.items.filter(i => i.itemId !== itemId)
        set({
          items: newItems,
          shopId: newItems.length === 0 ? null : state.shopId,
          shopName: newItems.length === 0 ? null : state.shopName,
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map(i =>
            i.itemId === itemId ? { ...i, quantity: Math.min(quantity, i.stockQty) } : i
          ),
        })
      },

      clearCart: () => set({ shopId: null, shopName: null, items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'localcart-cart',
    }
  )
)
