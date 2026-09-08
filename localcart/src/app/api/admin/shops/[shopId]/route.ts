import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

type Params = { params: Promise<{ shopId: string }> }

// PATCH /api/admin/shops/[shopId] — approve, reject, suspend, reactivate
export async function PATCH(request: NextRequest, { params }: Params) {
  const { shopId } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status, rejectionReason } = await request.json()

  if (!['APPROVED', 'SUSPENDED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const shop = await prisma.shop.update({
    where: { id: shopId },
    data: {
      status,
      ...(rejectionReason !== undefined ? { rejectionReason } : {}),
    },
  })

  return NextResponse.json({ shop })
}
