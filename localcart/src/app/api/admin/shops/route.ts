import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ShopStatus } from '@prisma/client'

// GET /api/admin/shops?status=PENDING&search=xx&page=1
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as ShopStatus | null
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where: any = {
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
      ],
    } : {}),
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shop.count({ where }),
  ])

  return NextResponse.json({ shops, total, page, pages: Math.ceil(total / limit) })
}
