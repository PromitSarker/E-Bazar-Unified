import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/customer/location
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.userId },
  })

  return NextResponse.json({ profile })
}

// PATCH /api/customer/location
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { latitude, longitude, defaultAddress } = await request.json()

  const profile = await prisma.customerProfile.upsert({
    where: { userId: session.userId },
    update: { latitude, longitude, defaultAddress },
    create: { userId: session.userId, latitude, longitude, defaultAddress },
  })

  return NextResponse.json({ profile })
}
