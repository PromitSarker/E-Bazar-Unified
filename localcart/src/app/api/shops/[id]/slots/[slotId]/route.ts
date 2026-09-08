import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// DELETE /api/shops/[id]/slots/[slotId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { id, slotId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop || shop.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.pickupSlot.delete({ where: { id: slotId } })
  return NextResponse.json({ message: 'Slot deleted' })
}
