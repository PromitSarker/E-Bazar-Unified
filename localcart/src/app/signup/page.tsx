'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Phone: 11 digits starting with 01'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function SignupForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'shop_owner' ? 'SHOP_OWNER' : 'CUSTOMER'
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>(initialRole)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
  })

  useEffect(() => { reset() }, [role, reset])

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    setLoading(true)
    try {
      const body: any = { ...data, role }
      if (role === 'SHOP_OWNER') {
        // For shop owner, use personal details as placeholder — they fill shop details after login
        body.shopName = `${data.name}'s Shop`
        body.shopAddress = 'Dhaka, Bangladesh'
        body.shopLatitude = 23.8103
        body.shopLongitude = 90.4125
        body.shopPhone = data.phone
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error ?? 'Registration failed', 'error')
        return
      }
      setUser(json.user)
      if (role === 'SHOP_OWNER') {
        showToast('Account created! Complete your shop profile.', 'success')
        router.replace('/shop/setup')
      } else {
        showToast('Welcome to LocalCart!', 'success')
        router.replace('/location')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-emerald-600">LocalCart</Link>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        {/* Role toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
          {(['CUSTOMER', 'SHOP_OWNER'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                role === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === 'CUSTOMER' ? 'Customer' : 'Shop Owner'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <Input label="Full name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" placeholder="01712345678" hint="11-digit Bangladeshi mobile number" error={errors.phone?.message} {...register('phone')} />
          <Input label="Password" type="password" placeholder="Min. 6 characters" error={errors.password?.message} {...register('password')} />

          {role === 'SHOP_OWNER' && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              You&apos;ll set your shop location and details after signup. Your shop will be reviewed before going live.
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            {role === 'CUSTOMER' ? 'Create account' : 'Register shop'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
