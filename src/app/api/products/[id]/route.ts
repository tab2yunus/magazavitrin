import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[id] - Get single product by id or slug
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        brand: true,
        category: { include: { parent: true, children: true } },
        store: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variations: true,
        attributes: true,
        reviews: { where: { isActive: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    // Get similar products
    const similarProducts = await db.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      include: { brand: true, store: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      take: 8,
    })

    // Get same store products
    const storeProducts = await db.product.findMany({
      where: { storeId: product.storeId, id: { not: product.id }, isActive: true },
      include: { brand: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      take: 8,
    })

    return NextResponse.json({ ...product, avgRating: Math.round(avgRating * 10) / 10, similarProducts, storeProducts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const product = await db.product.update({ where: { id }, data: body })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/products/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
