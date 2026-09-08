import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'

// GET /api/admin/categories
export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ categories })
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name } = categorySchema.parse(body)

  const existing = await prisma.category.findUnique({ where: { name } })
  if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 })

  const category = await prisma.category.create({ data: { name } })
  return NextResponse.json({ category }, { status: 201 })
}

// DELETE /api/admin/categories — body: { id }
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await request.json()
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}
