# --- Stage 1: Install dependencies -------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# --- Stage 2: Build the Next.js app -------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client at build time
RUN npx prisma generate

# Build Next.js (standalone output mode)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm run build

# --- Stage 3: Production runtime ----------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy Next.js standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy all runtime node_modules (including ts-node) for seed scripts and any other runtime tools
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma for runtime migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

# Install OpenSSL (required by Prisma query engine on Alpine)
RUN apk add --no-cache openssl

# Entrypoint script — fix Windows line endings (CRLF → LF) and make executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN apk add --no-cache dos2unix && dos2unix ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
