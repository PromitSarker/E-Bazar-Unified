import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateOrderStatusSchema } from '@/lib/validations'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

type Params = { params: Promise<{ orderId: string }> }

// Valid transitions by role
const SHOP_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELLED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

const CUSTOMER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PLACED: ['CANCELLED'],
}

// PATCH /api/orders/[orderId]/status
export async function PATCH(request: NextRequest, { params }: Params) {
  const { orderId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  try {
    const body = await request.json()
    const { status: newStatus, rejectionReason } = updateOrderStatusSchema.parse(body)

    let allowed = false

    if (session.role === 'SHOP_OWNER') {
      if (order.shop.ownerId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const transitions = SHOP_TRANSITIONS[order.status] ?? []
      allowed = transitions.includes(newStatus as OrderStatus)
    } else if (session.role === 'CUSTOMER') {
      if (order.customerId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const transitions = CUSTOMER_TRANSITIONS[order.status] ?? []
      allowed = transitions.includes(newStatus as OrderStatus)
    } else if (session.role === 'ADMIN') {
      allowed = true
    }

    if (!allowed) {
      return NextResponse.json({
        error: `Cannot transition order from ${order.status} to ${newStatus}`,
      }, { status: 400 })
    }

    // If cancelling, restore stock
    if (newStatus === 'CANCELLED') {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId } })
      await prisma.$transaction(
        orderItems.map(item =>
          prisma.item.update({
            where: { id: item.itemId },
            data: { stockQty: { increment: item.quantity } },
          })
        )
      )
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as OrderStatus,
        ...(rejectionReason ? { rejectionReason } : {}),
      },
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 })
  }
}
