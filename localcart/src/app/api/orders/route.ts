import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createOrderSchema } from '@/lib/validations'
import { haversineKm } from '@/lib/haversine'
import { z } from 'zod'

// GET /api/orders — list orders for current user
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  let where: any = {}

  if (session.role === 'CUSTOMER') {
    where.customerId = session.userId
  } else if (session.role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findUnique({ where: { ownerId: session.userId } })
    if (!shop) return NextResponse.json({ orders: [] })
    where.shopId = shop.id
  }
  // ADMIN: sees all orders (handled via /api/admin/orders)

  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        shop: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
        items: true,
        pickupSlot: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/orders — create new order
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Load shop
    const shop = await prisma.shop.findUnique({ where: { id: data.shopId } })
    if (!shop || shop.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Shop not available' }, { status: 400 })
    }
    if (!shop.isOpen) {
      return NextResponse.json({ error: 'Shop is currently closed' }, { status: 400 })
    }

    // Validate delivery radius
    if (data.type === 'DELIVERY') {
      if (!data.deliveryLat || !data.deliveryLng) {
        return NextResponse.json({ error: 'Delivery address required' }, { status: 400 })
      }
      const dist = haversineKm(shop.latitude, shop.longitude, data.deliveryLat, data.deliveryLng)
      if (dist > shop.deliveryRadiusKm) {
        return NextResponse.json({
          error: `Delivery not available to your location (${dist.toFixed(1)}km away, max ${shop.deliveryRadiusKm}km)`,
        }, { status: 400 })
      }
    }

    // Load items and check stock
    const itemIds = data.items.map(i => i.itemId)
    const dbItems = await prisma.item.findMany({
      where: { id: { in: itemIds }, shopId: data.shopId, inStock: true },
    })

    if (dbItems.length !== itemIds.length) {
      return NextResponse.json({ error: 'Some items are no longer available' }, { status: 400 })
    }

    // Check stock quantities
    for (const cartItem of data.items) {
      const dbItem = dbItems.find(i => i.id === cartItem.itemId)!
      if (dbItem.stockQty < cartItem.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${dbItem.name}" (available: ${dbItem.stockQty})`,
        }, { status: 400 })
      }
    }

    // Calculate totals
    const orderItems = data.items.map(cartItem => {
      const dbItem = dbItems.find(i => i.id === cartItem.itemId)!
      return {
        itemId: cartItem.itemId,
        itemNameSnapshot: dbItem.name,
        unitPriceSnapshot: dbItem.price,
        quantity: cartItem.quantity,
        lineTotal: dbItem.price * cartItem.quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0)
    const deliveryFee = data.type === 'DELIVERY' ? shop.deliveryFee : 0
    const total = subtotal + deliveryFee

    if (data.type === 'DELIVERY' && shop.minOrderAmount > 0 && subtotal < shop.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order for delivery is ৳${shop.minOrderAmount}`,
      }, { status: 400 })
    }

    const paymentStatus = data.paymentMethod === 'CASH' ? 'COD' : 'UNPAID'

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const cartItem of data.items) {
        await tx.item.update({
          where: { id: cartItem.itemId },
          data: { stockQty: { decrement: cartItem.quantity } },
        })
      }

      return tx.order.create({
        data: {
          customerId: session.userId,
          shopId: data.shopId,
          type: data.type,
          paymentMethod: data.paymentMethod,
          paymentStatus,
          deliveryAddress: data.deliveryAddress,
          deliveryLat: data.deliveryLat,
          deliveryLng: data.deliveryLng,
          pickupSlotId: data.pickupSlotId,
          deliveryFee,
          subtotal,
          total,
          notes: data.notes,
          items: { create: orderItems },
        },
        include: { items: true, shop: { select: { name: true } } },
      })
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
