'use client'

import * as React from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCartStore } from '@/store/cart'

export function CustomerNavbar() {
  const { user, logout } = useAuthStore()
  const totalItems = useCartStore(s => s.getTotalItems())
  const [cartOpen, setCartOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/shops" className="text-lg font-bold text-emerald-600 tracking-tight">
            LocalCart
          </Link>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-medium py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="truncate max-w-[80px]">{user?.name?.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                  <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <Link href="/location" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Location</Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export function ShopNavbar() {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/shop/dashboard" className="text-lg font-bold text-emerald-600 tracking-tight">
          LocalCart <span className="text-xs font-normal text-gray-400 ml-1">Shop</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/shop/dashboard', label: 'Dashboard' },
            { href: '/shop/inventory', label: 'Inventory' },
            { href: '/shop/orders', label: 'Orders' },
            { href: '/shop/slots', label: 'Slots' },
            { href: '/shop/setup', label: 'Settings' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 text-sm text-gray-700 font-medium py-1 px-2 rounded-lg hover:bg-gray-100"
          >
            <span className="truncate max-w-[80px]">{user?.name?.split(' ')[0]}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
              {/* Mobile nav links */}
              <div className="sm:hidden">
                <Link href="/shop/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link href="/shop/inventory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Inventory</Link>
                <Link href="/shop/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link href="/shop/slots" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Slots</Link>
                <hr className="my-1 border-gray-100" />
              </div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export function AdminNavbar() {
  const { logout } = useAuthStore()

  return (
    <nav className="sticky top-0 z-40 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          LocalCart <span className="text-xs font-normal text-gray-400 ml-1">Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/approvals', label: 'Approvals' },
            { href: '/admin/shops', label: 'Shops' },
            { href: '/admin/customers', label: 'Customers' },
            { href: '/admin/orders', label: 'Orders' },
            { href: '/admin/categories', label: 'Categories' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="px-2.5 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden sm:block">
              {link.label}
            </Link>
          ))}
          <button onClick={logout} className="ml-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
