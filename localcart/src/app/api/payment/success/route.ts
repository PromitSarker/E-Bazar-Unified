import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSSLCommerzPayment } from '@/lib/sslcommerz'

// POST /api/payment/success — called by SSLCommerz server-to-server
export async function POST(request: NextRequest) {
  const body = await request.formData()
  const params: Record<string, string> = {}
  body.forEach((value, key) => { params[key] = value.toString() })

  const orderId = params.tran_id
  const valId = params.val_id

  if (!orderId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail?reason=missing_tran_id`)
  }

  // Validate payment with SSLCommerz
  const isValid = await validateSSLCommerzPayment(params)

  if (!isValid) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' },
    })
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail?orderId=${orderId}`)
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      sslTransactionId: params.bank_tran_id,
      sslValId: valId,
    },
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${orderId}`)
}
