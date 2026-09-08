import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createReviewSchema } from '@/lib/validations'
import { z } from 'zod'

type Params = { params: Promise<{ orderId: string }> }

// POST /api/orders/[orderId]/review
export async function POST(request: NextRequest, { params }: Params) {
  const { orderId } = await params
  const session = await getSession()
  if (!session || session.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.customerId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (order.status !== 'COMPLETED') return NextResponse.json({ error: 'Can only review completed orders' }, { status: 400 })
  if (order.review) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  try {
    const body = await request.json()
    const { rating, comment } = createReviewSchema.parse(body)

    // Create review and update shop rating average in a transaction
    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          orderId,
          customerId: session.userId,
          shopId: order.shopId,
          rating,
          comment,
        },
      })

      // Recalculate shop rating
      const agg = await tx.review.aggregate({
        where: { shopId: order.shopId },
        _avg: { rating: true },
        _count: { rating: true },
      })

      await tx.shop.update({
        where: { id: order.shopId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count.rating,
        },
      })

      return r
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Review failed' }, { status: 500 })
  }
}
