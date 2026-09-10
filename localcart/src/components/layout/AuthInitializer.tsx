'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

/**
 * Runs on mount — fetches /api/auth/me to sync server session into client Zustand store.
 * Sets hasHydrated=true when done so AuthGuard knows it's safe to make redirect decisions.
 */
export function AuthInitializer() {
  const { setUser, setLoading, setHasHydrated } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setUser(data?.user ?? null)
      })
      .catch(() => setUser(null))
      .finally(() => {
        setLoading(false)
        setHasHydrated(true)
      })
  }, [setUser, setLoading, setHasHydrated])

  return null
}
