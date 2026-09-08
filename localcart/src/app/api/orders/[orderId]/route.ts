import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

type Params = { params: Promise<{ orderId: string }> }

// GET /api/orders/[orderId]
export async function GET(request: NextRequest, { params }: Params) {
  const { orderId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shop: { select: { id: true, name: true, address: true, phone: true, latitude: true, longitude: true } },
      customer: { select: { id: true, name: true, phone: true } },
      pickupSlot: true,
      review: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Access control
  const canAccess =
    session.role === 'ADMIN' ||
    order.customerId === session.userId ||
    (session.role === 'SHOP_OWNER' &&
      (await prisma.shop.findFirst({ where: { id: order.shopId, ownerId: session.userId } })))

  if (!canAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ order })
}
