import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { initSSLCommerzPayment } from '@/lib/sslcommerz'

// POST /api/payment/initiate — { orderId }
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await request.json()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { name: true, email: true, phone: true, customerProfile: true } },
      shop: { select: { name: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.customerId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (order.paymentMethod !== 'SSLCOMMERZ') return NextResponse.json({ error: 'Not an online payment order' }, { status: 400 })
  if (order.paymentStatus === 'PAID') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  try {
    const result = await initSSLCommerzPayment({
      orderId: order.id,
      amount: order.total,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerAddress: order.deliveryAddress ?? order.customer.customerProfile?.defaultAddress ?? 'Dhaka, Bangladesh',
      productName: `Order from ${order.shop.name}`,
    })

    if (result.status !== 'SUCCESS' && !result.GatewayPageURL) {
      return NextResponse.json({ error: result.failedreason ?? 'Payment initiation failed' }, { status: 500 })
    }

    const gatewayUrl = result.GatewayPageURL ?? result.gatewayPageURL

    return NextResponse.json({ gatewayUrl })
  } catch (error) {
    console.error('SSLCommerz initiation error:', error)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 })
  }
}
