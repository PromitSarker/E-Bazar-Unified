import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateShopSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/shops/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      category: true,
      owner: { select: { name: true, phone: true } },
      _count: { select: { reviews: true } },
    },
  })
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  return NextResponse.json({ shop })
}

// PATCH /api/shops/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

  // Only owner or admin can update
  if (session.role !== 'ADMIN' && shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateShopSchema.parse(body) as any
    const updated = await prisma.shop.update({ where: { id }, data })
    return NextResponse.json({ shop: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
