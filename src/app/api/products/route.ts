import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products - List products with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const store = searchParams.get('store')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const bestSeller = searchParams.get('bestSeller')
    const isNew = searchParams.get('new')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const active = searchParams.get('active')
    const admin = searchParams.get('admin')

    const where: any = {}
    if (admin === 'true') {
      // Admin mode: show all products unless specifically filtered
      if (active !== null) where.isActive = active === 'true'
    } else {
      if (active !== null && active !== undefined) {
        where.isActive = active === 'true'
      } else {
        where.isActive = true
      }
    }
    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } })
      if (cat) {
        const childCats = await db.category.findMany({ where: { parentId: cat.id } })
        const catIds = [cat.id, ...childCats.map(c => c.id)]
        where.categoryId = { in: catIds }
      }
    }
    if (brand) {
      const b = await db.brand.findFirst({ where: { slug: brand } })
      if (b) where.brandId = b.id
    }
    if (store) {
      const s = await db.store.findFirst({ where: { slug: store } })
      if (s) where.storeId = s.id
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ]
    }
    if (featured === 'true') where.isFeatured = true
    if (bestSeller === 'true') where.isBestSeller = true
    if (isNew === 'true') where.isNew = true
    if (minPrice || maxPrice) {
      where.normalPrice = {}
      if (minPrice) where.normalPrice.gte = parseFloat(minPrice)
      if (maxPrice) where.normalPrice.lte = parseFloat(maxPrice)
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { normalPrice: 'asc' }
    if (sort === 'price_desc') orderBy = { normalPrice: 'desc' }
    if (sort === 'name_asc') orderBy = { name: 'asc' }
    if (sort === 'best_seller') orderBy = { salesCount: 'desc' }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          store: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variations: true,
          reviews: { where: { isActive: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    // Calculate average rating
    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length 
        : 0
      const { reviews, ...rest } = p
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: p.reviews.length }
    })

    return NextResponse.json({ products: productsWithRating, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/products - Create product
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: body.sku,
        barcode: body.barcode,
        description: body.description,
        shortDescription: body.shortDescription,
        normalPrice: parseFloat(body.normalPrice),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        stock: parseInt(body.stock) || 0,
        shippingTime: body.shippingTime,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        isBestSeller: body.isBestSeller ?? false,
        isNew: body.isNew ?? false,
        brandId: body.brandId || null,
        categoryId: body.categoryId || null,
        storeId: body.storeId || null,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        focusKeyword: body.focusKeyword,
        canonicalUrl: body.canonicalUrl,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
