import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, createAuthCookie } from '@/lib/auth'
import { registerCustomerSchema, registerShopOwnerSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const bodySchema = z.object({
  role: z.enum(['CUSTOMER', 'SHOP_OWNER']),
}).passthrough()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role } = bodySchema.parse(body)

    if (role === 'CUSTOMER') {
      const data = registerCustomerSchema.parse(body)

      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      const passwordHash = await bcrypt.hash(data.password, 12)

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: 'CUSTOMER',
          customerProfile: {
            create: {},
          },
        },
      })

      const token = await signToken({ userId: user.id, role: user.role, email: user.email })
      const response = NextResponse.json(
        { message: 'Registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } },
        { status: 201 }
      )
      const cookieOptions = createAuthCookie(token)
      response.cookies.set(cookieOptions.name, cookieOptions.value, {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path,
      })
      return response
    }

    if (role === 'SHOP_OWNER') {
      const data = registerShopOwnerSchema.parse(body)

      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      const passwordHash = await bcrypt.hash(data.password, 12)

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: 'SHOP_OWNER',
          shop: {
            create: {
              name: data.shopName,
              address: data.shopAddress,
              latitude: data.shopLatitude,
              longitude: data.shopLongitude,
              phone: data.shopPhone,
              categoryId: data.categoryId ?? null,
              status: 'PENDING',
            },
          },
        },
      })

      const token = await signToken({ userId: user.id, role: user.role, email: user.email })
      const response = NextResponse.json(
        {
          message: 'Shop registration submitted. Await admin approval.',
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
        { status: 201 }
      )
      const cookieOptions = createAuthCookie(token)
      response.cookies.set(cookieOptions.name, cookieOptions.value, {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path,
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
