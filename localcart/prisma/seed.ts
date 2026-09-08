import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: 'Grocery' }, update: {}, create: { name: 'Grocery' } }),
    prisma.category.upsert({ where: { name: 'Vegetables & Fruits' }, update: {}, create: { name: 'Vegetables & Fruits' } }),
    prisma.category.upsert({ where: { name: 'Meat & Fish' }, update: {}, create: { name: 'Meat & Fish' } }),
    prisma.category.upsert({ where: { name: 'Dairy & Eggs' }, update: {}, create: { name: 'Dairy & Eggs' } }),
    prisma.category.upsert({ where: { name: 'Bakery' }, update: {}, create: { name: 'Bakery' } }),
    prisma.category.upsert({ where: { name: 'General Store' }, update: {}, create: { name: 'General Store' } }),
  ])
  console.log(`✅ Categories: ${cats.map(c => c.name).join(', ')}`)

  const hash = await bcrypt.hash('password123', 12)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@localcart.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@localcart.com',
      phone: '01700000001',
      passwordHash: hash,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin: ${admin.email}`)

  // Shop owner 1 (approved)
  const owner1 = await prisma.user.upsert({
    where: { email: 'shop1@localcart.com' },
    update: {},
    create: {
      name: 'Rahman Grocery',
      email: 'shop1@localcart.com',
      phone: '01711111111',
      passwordHash: hash,
      role: 'SHOP_OWNER',
      shop: {
        create: {
          name: 'Rahman Grocery Store',
          categoryId: cats[0].id,
          address: 'Mirpur-10, Dhaka',
          latitude: 23.8069,
          longitude: 90.3685,
          phone: '01711111111',
          status: 'APPROVED',
          isOpen: true,
          deliveryRadiusKm: 5,
          deliveryFee: 30,
          minOrderAmount: 100,
          operatingHours: {
            sun: { open: '08:00', close: '22:00' },
            mon: { open: '08:00', close: '22:00' },
            tue: { open: '08:00', close: '22:00' },
            wed: { open: '08:00', close: '22:00' },
            thu: { open: '08:00', close: '22:00' },
            fri: { open: '14:00', close: '22:00' },
            sat: { open: '08:00', close: '22:00' },
          },
        },
      },
    },
    include: { shop: true },
  })
  console.log(`✅ Shop owner 1: ${owner1.email}`)

  const shop1 = owner1.shop!

  // Items for shop 1
  const items1 = await Promise.all([
    { name: 'Atta Flour', unit: 'kg', price: 55, stockQty: 100 },
    { name: 'Basmati Rice', unit: 'kg', price: 120, stockQty: 200 },
    { name: 'Mustard Oil', unit: 'liter', price: 200, stockQty: 50 },
    { name: 'Sugar', unit: 'kg', price: 130, stockQty: 80 },
    { name: 'Salt (Iodized)', unit: 'kg', price: 25, stockQty: 150 },
    { name: 'Red Lentil', unit: 'kg', price: 115, stockQty: 60 },
    { name: 'Chickpeas', unit: 'kg', price: 90, stockQty: 40 },
    { name: 'Soybean Oil', unit: 'liter', price: 175, stockQty: 70 },
    { name: 'Tea Leaves', unit: 'kg', price: 300, stockQty: 30 },
    { name: 'Turmeric Powder', unit: 'kg', price: 250, stockQty: 25 },
  ].map(item => prisma.item.create({
    data: { shopId: shop1.id, categoryId: cats[0].id, inStock: true, ...item },
  })))
  console.log(`✅ Items for shop 1: ${items1.length}`)

  // Pickup slots for shop 1
  for (let day = 0; day <= 6; day++) {
    if (day === 5) continue // Friday: only afternoon
    await prisma.pickupSlot.createMany({
      data: [
        { shopId: shop1.id, dayOfWeek: day, startTime: '09:00', endTime: '11:00', maxOrders: 10 },
        { shopId: shop1.id, dayOfWeek: day, startTime: '15:00', endTime: '17:00', maxOrders: 10 },
        { shopId: shop1.id, dayOfWeek: day, startTime: '19:00', endTime: '21:00', maxOrders: 8 },
      ],
      skipDuplicates: true,
    })
  }
  console.log(`✅ Pickup slots for shop 1`)

  // Shop owner 2 (pending)
  const owner2 = await prisma.user.upsert({
    where: { email: 'shop2@localcart.com' },
    update: {},
    create: {
      name: 'Karim Veggies',
      email: 'shop2@localcart.com',
      phone: '01722222222',
      passwordHash: hash,
      role: 'SHOP_OWNER',
      shop: {
        create: {
          name: 'Karim Fresh Vegetables',
          categoryId: cats[1].id,
          address: 'Dhanmondi-27, Dhaka',
          latitude: 23.7463,
          longitude: 90.3713,
          phone: '01722222222',
          status: 'PENDING',
          isOpen: false,
          deliveryRadiusKm: 3,
          deliveryFee: 20,
        },
      },
    },
  })
  console.log(`✅ Shop owner 2 (pending): ${owner2.email}`)

  // Customers
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@localcart.com' },
    update: {},
    create: {
      name: 'Fatima Begum',
      email: 'customer1@localcart.com',
      phone: '01733333333',
      passwordHash: hash,
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          defaultAddress: 'Mirpur-12, Dhaka',
          latitude: 23.8210,
          longitude: 90.3653,
        },
      },
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@localcart.com' },
    update: {},
    create: {
      name: 'Rahim Ahmed',
      email: 'customer2@localcart.com',
      phone: '01744444444',
      passwordHash: hash,
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          defaultAddress: 'Mirpur-10, Dhaka',
          latitude: 23.8050,
          longitude: 90.3700,
        },
      },
    },
  })
  console.log(`✅ Customers: ${customer1.email}, ${customer2.email}`)

  // Sample completed order
  const sampleOrder = await prisma.order.create({
    data: {
      customerId: customer1.id,
      shopId: shop1.id,
      type: 'DELIVERY',
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      paymentStatus: 'COD',
      deliveryAddress: 'Mirpur-12, Dhaka',
      deliveryLat: 23.8210,
      deliveryLng: 90.3653,
      deliveryFee: 30,
      subtotal: 330,
      total: 360,
      items: {
        create: [
          {
            itemId: items1[0].id,
            itemNameSnapshot: items1[0].name,
            unitPriceSnapshot: items1[0].price,
            quantity: 2,
            lineTotal: items1[0].price * 2,
          },
          {
            itemId: items1[3].id,
            itemNameSnapshot: items1[3].name,
            unitPriceSnapshot: items1[3].price,
            quantity: 1,
            lineTotal: items1[3].price,
          },
        ],
      },
    },
  })

  // Review for completed order
  await prisma.review.create({
    data: {
      orderId: sampleOrder.id,
      customerId: customer1.id,
      shopId: shop1.id,
      rating: 5,
      comment: 'Very fresh items, fast delivery!',
    },
  })
  await prisma.shop.update({
    where: { id: shop1.id },
    data: { ratingAvg: 5, ratingCount: 1 },
  })

  console.log(`✅ Sample order and review created`)

  console.log('\n🎉 Seed complete!\n')
  console.log('Demo accounts (all passwords: password123):')
  console.log('  Admin:       admin@localcart.com')
  console.log('  Shop Owner:  shop1@localcart.com  (approved)')
  console.log('  Shop Owner:  shop2@localcart.com  (pending)')
  console.log('  Customer:    customer1@localcart.com')
  console.log('  Customer:    customer2@localcart.com')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
