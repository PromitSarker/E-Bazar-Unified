import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const orderId = body.get('tran_id')?.toString()

  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' },
    }).catch(() => {}) // Ignore if already updated
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail?orderId=${orderId ?? ''}`
  )
}
