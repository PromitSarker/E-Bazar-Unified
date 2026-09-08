import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateItemSchema } from '@/lib/validations'
import { z } from 'zod'

type Params = { params: Promise<{ id: string; itemId: string }> }

// GET /api/shops/[id]/items/[itemId]
export async function GET(request: NextRequest, { params }: Params) {
  const { itemId } = await params
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { category: true } })
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  return NextResponse.json({ item })
}

// PATCH /api/shops/[id]/items/[itemId]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, itemId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop || shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateItemSchema.parse(body)
    const item = await prisma.item.update({ where: { id: itemId }, data })
    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/shops/[id]/items/[itemId]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id, itemId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop || shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.item.delete({ where: { id: itemId } })
  return NextResponse.json({ message: 'Deleted' })
}
