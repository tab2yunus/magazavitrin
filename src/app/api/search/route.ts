import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    if (!q) return NextResponse.json({ products: [], stores: [], categories: [], brands: [] })

    const [products, stores, categories, brands] = await Promise.all([
      db.product.findMany({
        where: { OR: [{ name: { contains: q } }, { description: { contains: q } }], isActive: true },
        include: { brand: true, store: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        take: 20,
      }),
      db.store.findMany({
        where: { OR: [{ name: { contains: q } }, { description: { contains: q } }], isActive: true },
        take: 5,
      }),
      db.category.findMany({
        where: { name: { contains: q }, isActive: true },
        take: 5,
      }),
      db.brand.findMany({
        where: { OR: [{ name: { contains: q } }, { description: { contains: q } }], isActive: true },
        take: 5,
      }),
    ])

    return NextResponse.json({ products, stores, categories, brands })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
