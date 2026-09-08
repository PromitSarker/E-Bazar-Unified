import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/shop/stats
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'SHOP_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const shop = await prisma.shop.findUnique({ where: { ownerId: session.userId } })
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [todayOrders, todayRevenue, weekRevenue, activeOrders, topItems] = await Promise.all([
    prisma.order.count({
      where: { shopId: shop.id, createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      where: { shopId: shop.id, status: 'COMPLETED', createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { shopId: shop.id, status: 'COMPLETED', createdAt: { gte: weekStart } },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        shopId: shop.id,
        status: { in: ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'] },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['itemNameSnapshot'],
      where: { order: { shopId: shop.id, status: 'COMPLETED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  return NextResponse.json({
    shopId: shop.id,
    shopName: shop.name,
    shopStatus: shop.status,
    isOpen: shop.isOpen,
    todayOrders,
    todayRevenue: todayRevenue._sum.total ?? 0,
    weekRevenue: weekRevenue._sum.total ?? 0,
    activeOrders,
    topItems: topItems.map(i => ({ name: i.itemNameSnapshot, qty: i._sum.quantity ?? 0 })),
    ratingAvg: shop.ratingAvg,
    ratingCount: shop.ratingCount,
  })
}
