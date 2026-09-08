'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

/**
 * Runs on mount — fetches /api/auth/me to sync server session into client Zustand store.
 */
export function AuthInitializer() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setUser(data?.user ?? null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return null
}
