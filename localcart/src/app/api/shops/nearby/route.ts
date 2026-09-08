import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { haversineKm } from '@/lib/haversine'

// GET /api/shops/nearby?lat=xx&lng=xx&radius=10&category=xx&search=xx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const radius = parseFloat(searchParams.get('radius') ?? process.env.NEXT_PUBLIC_DEFAULT_RADIUS_KM ?? '10')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const shops = await prisma.shop.findMany({
    where: {
      status: 'APPROVED',
      ...(category ? { category: { name: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      _count: { select: { reviews: true } },
    },
  })

  // Filter by radius using Haversine and sort by distance
  const withDistance = shops
    .map(shop => ({
      ...shop,
      distanceKm: haversineKm(lat, lng, shop.latitude, shop.longitude),
    }))
    .filter(shop => shop.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  return NextResponse.json({ shops: withDistance })
}
