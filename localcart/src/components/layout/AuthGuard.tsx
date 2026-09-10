'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Role } from '@prisma/client'
import { Spinner } from '@/components/ui/Spinner'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

/**
 * Wraps a page to:
 * 1. Show a spinner while the session is being fetched (prevents redirect race condition)
 * 2. Redirect to /login if not authenticated
 * 3. Redirect to / if authenticated but wrong role
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) { router.replace('/login'); return }
    if (allowedRoles && !allowedRoles.includes(user.role)) { router.replace('/') }
  }, [hasHydrated, user, allowedRoles, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return null
  if (allowedRoles && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
