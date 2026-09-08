import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createItemSchema, updateItemSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/shops/[id]/items
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const inStockOnly = searchParams.get('inStock') === 'true'

  const items = await prisma.item.findMany({
    where: {
      shopId: id,
      ...(inStockOnly ? { inStock: true } : {}),
    },
    include: { category: true },
    orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json({ items })
}

// POST /api/shops/[id]/items
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify owner
  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop || shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = createItemSchema.parse(body)
    const item = await prisma.item.create({
      data: { ...data, shopId: id },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
