import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const orderId = body.get('tran_id')?.toString()
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail?orderId=${orderId ?? ''}&reason=cancelled`
  )
}
