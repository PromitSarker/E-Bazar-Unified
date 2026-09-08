import { NextResponse } from 'next/server'

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Format currency in BDT (Bangladeshi Taka)
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get status badge color class
 */
export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    PREPARING: 'bg-yellow-100 text-yellow-800',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
    READY_FOR_PICKUP: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'Placed',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    READY_FOR_PICKUP: 'Ready for Pickup',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  return map[status] ?? status
}

export function getPaymentStatusColor(status: string): string {
  const map: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    COD: 'bg-gray-100 text-gray-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function getPaymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    UNPAID: 'Unpaid',
    PAID: 'Paid',
    FAILED: 'Failed',
    COD: 'Cash on Delivery',
  }
  return map[status] ?? status
}

export function getShopStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

/**
 * Format distance in km
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`
  return `${km.toFixed(1)}km`
}
