import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const store = await db.store.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: {
          where: { isActive: true },
          include: { brand: true, category: true, images: { take: 1, orderBy: { sortOrder: 'asc' } }, reviews: { where: { isActive: true } } },
        },
        questions: { where: { isActive: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    // Add avg rating to products
    const storeWithRatings = {
      ...store,
      products: store.products.map(p => {
        const avgRating = p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0
        const { reviews, ...rest } = p
        return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
      }),
    }

    return NextResponse.json(storeWithRatings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const store = await db.store.update({ where: { id }, data: body })
    return NextResponse.json(store)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.store.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
