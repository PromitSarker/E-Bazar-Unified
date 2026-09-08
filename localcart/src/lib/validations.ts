import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, 'Phone must be 11 digits starting with 01 (e.g. 01712345678)')

export const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerShopOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Shop info
  shopName: z.string().min(2, 'Shop name required'),
  shopAddress: z.string().min(5, 'Address required'),
  shopLatitude: z.number(),
  shopLongitude: z.number(),
  shopPhone: phoneSchema,
  categoryId: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
})

// ─── Shop ─────────────────────────────────────────────────────────────────────

export const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: phoneSchema.optional(),
  categoryId: z.string().nullable().optional(),
  deliveryRadiusKm: z.number().min(0).max(50).optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  isOpen: z.boolean().optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional(),
  })).optional(),
})

// ─── Item ─────────────────────────────────────────────────────────────────────

export const createItemSchema = z.object({
  name: z.string().min(1, 'Item name required'),
  categoryId: z.string().nullable().optional(),
  unit: z.string().min(1, 'Unit required (e.g. kg, pcs, liter)'),
  price: z.number().positive('Price must be positive'),
  stockQty: z.number().int().min(0, 'Stock cannot be negative'),
  photoUrl: z.string().url().nullable().optional(),
  inStock: z.boolean().optional(),
})

export const updateItemSchema = createItemSchema.partial()

// ─── Pickup Slot ──────────────────────────────────────────────────────────────

export const createSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  specificDate: z.string().nullable().optional(), // ISO date string
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  maxOrders: z.number().int().min(1).default(10),
})

// ─── Order ────────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  shopId: z.string(),
  type: z.enum(['DELIVERY', 'PICKUP']),
  paymentMethod: z.enum(['CASH', 'SSLCOMMERZ']),
  deliveryAddress: z.string().optional(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  pickupSlotId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().min(1),
  })).min(1, 'Cart cannot be empty'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']),
  rejectionReason: z.string().optional(),
})

// ─── Review ───────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

// ─── Location ─────────────────────────────────────────────────────────────────

export const setLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  defaultAddress: z.string().optional(),
})

// ─── Category ─────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name required'),
})
