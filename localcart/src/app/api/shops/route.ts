import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/shops — list approved shops (public, for admin use)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const shops = await prisma.shop.findMany({
    where: status ? { status: status as any } : { status: 'APPROVED' },
    include: { category: true },
    orderBy: { name: 'asc' },
    take: 50,
  })
  return NextResponse.json({ shops })
}
