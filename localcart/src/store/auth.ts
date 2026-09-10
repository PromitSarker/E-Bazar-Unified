'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  isActive: boolean
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  hasHydrated: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (v: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({ user: null })
        window.location.href = '/login'
      },
    }),
    {
      name: 'localcart-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
