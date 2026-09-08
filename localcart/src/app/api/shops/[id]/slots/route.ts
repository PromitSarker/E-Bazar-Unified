import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlotSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/shops/[id]/slots
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slots = await prisma.pickupSlot.findMany({
    where: { shopId: id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })
  return NextResponse.json({ slots })
}

// POST /api/shops/[id]/slots
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop || shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = createSlotSchema.parse(body)
    const slot = await prisma.pickupSlot.create({
      data: {
        shopId: id,
        dayOfWeek: data.dayOfWeek ?? null,
        specificDate: data.specificDate ? new Date(data.specificDate) : null,
        startTime: data.startTime,
        endTime: data.endTime,
        maxOrders: data.maxOrders,
      },
    })
    return NextResponse.json({ slot }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
