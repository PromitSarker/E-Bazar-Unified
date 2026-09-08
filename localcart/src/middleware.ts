import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/register', '/api/auth/logout']
const CUSTOMER_PATHS = ['/customer', '/checkout', '/cart', '/orders', '/shops', '/location']
const SHOP_OWNER_PATHS = ['/shop']
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  // Allow public API reads (nearby shops, shop details, items)
  if (
    pathname.startsWith('/api/shops') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/payment/success') ||
    pathname.startsWith('/api/payment/fail') ||
    pathname.startsWith('/api/payment/cancel') ||
    pathname.startsWith('/api/payment/ipn')
  ) {
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(request)

  // Not authenticated
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route protection
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (SHOP_OWNER_PATHS.some(p => pathname.startsWith(p))) {
    if (session.role !== 'SHOP_OWNER') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // API role checks
  if (pathname.startsWith('/api/admin') && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (pathname.startsWith('/api/shop') && session.role !== 'SHOP_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
