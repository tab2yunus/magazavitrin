import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraper/products - Get imported products with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const published = searchParams.get('published') // 'true' | 'false' | null

    const where: any = { sourceSupplier: 'MOTOLUX' }
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }
    if (published === 'true') {
      where.isPublished = true
    } else if (published === 'false') {
      where.isPublished = false
    }

    const [products, total] = await Promise.all([
      db.importedProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.importedProduct.count({ where }),
    ])

    // Get unique categories
    const categories = await db.importedProduct.findMany({
      where: { sourceSupplier: 'MOTOLUX' },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map(c => c.category).filter(Boolean),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/scraper/products - Delete all imported products
export async function DELETE() {
  try {
    const result = await db.importedProduct.deleteMany({
      where: { sourceSupplier: 'MOTOLUX' },
    })
    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
