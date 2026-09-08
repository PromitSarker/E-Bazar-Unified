# LocalCart

A location-based multi-tenant grocery marketplace connecting local shop owners with nearby customers.

## Features
- **Customers**: Find nearby grocery shops using geolocation, browse real-time inventory, place orders, choose pickup or delivery, and pay via Cash on Delivery or SSLCommerz.
- **Shop Owners**: Manage shop settings, delivery radius, inventory stock, operating hours, and pickup slots. Receive and process orders in real-time.
- **Admin**: Approve or suspend shops, manage user accounts, oversee all orders, and view platform statistics.
- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Leaflet (Maps), Zustand, Zod.

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally or remotely

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database configuration**
   Create a PostgreSQL database named `localcart`.
   If you have a `.env.local` file already (from our setup), copy it to `.env`:
   ```bash
   cp .env.local .env
   ```
   Or create `.env` manually and set your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/localcart"
   JWT_SECRET="localcart-dev-secret-change-in-production-abc123xyz"
   SSLCOMMERZ_STORE_ID="testbox"
   SSLCOMMERZ_STORE_PASSWD="qwerty"
   SSLCOMMERZ_IS_LIVE="false"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   NEXT_PUBLIC_DEFAULT_RADIUS_KM="10"
   ```

3. **Push Prisma Schema**
   ```bash
   npx prisma db push
   ```

4. **Seed the Database**
   This creates demo admin, shops, categories, items, and customers.
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Demo Accounts
All passwords are `password123`.
- **Admin**: `admin@localcart.com`
- **Shop Owner**: `shop1@localcart.com` (approved, with items)
- **Shop Owner 2**: `shop2@localcart.com` (pending approval)
- **Customer**: `customer1@localcart.com`
- **Customer 2**: `customer2@localcart.com`
