import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/admin/stats
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    totalShops,
    pendingShops,
    totalCustomers,
    totalOrders,
    completedOrders,
    cancelledOrders,
    gmvResult,
    todayOrders,
    todayGMV,
  ] = await Promise.all([
    prisma.shop.count({ where: { status: 'APPROVED' } }),
    prisma.shop.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { total: true },
    }),
  ])

  return NextResponse.json({
    totalShops,
    pendingShops,
    totalCustomers,
    totalOrders,
    completedOrders,
    cancelledOrders,
    gmv: gmvResult._sum.total ?? 0,
    todayOrders,
    todayGMV: todayGMV._sum.total ?? 0,
  })
}
