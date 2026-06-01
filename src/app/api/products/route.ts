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
    const publishStatus = searchParams.get('publishStatus')

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
    if (publishStatus) {
      where.publishStatus = publishStatus
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

// Helper: Turkish-safe slug generation
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// POST /api/products - Create product
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate discount price
    if (body.discountPrice && body.normalPrice && parseFloat(body.discountPrice) > parseFloat(body.normalPrice)) {
      return NextResponse.json({ error: 'İndirimli fiyat normal fiyattan yüksek olamaz' }, { status: 400 })
    }

    const slug = body.slug || generateSlug(body.name)

    // Check slug uniqueness
    const existing = await db.product.findFirst({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor', slug }, { status: 409 })
    }

    // Extract attributes
    const attributes = body.attributes || []

    const product = await db.product.create({
      data: {
        name: body.name,
        slug,
        sku: body.sku || null,
        barcode: body.barcode || null,
        oemCode: body.oemCode || null,
        productCode: body.productCode || null,
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        normalPrice: parseFloat(body.normalPrice),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        stock: parseInt(body.stock) || 0,
        stockStatus: body.stockStatus || 'instock',
        criticalStock: parseInt(body.criticalStock) || 5,
        shippingWeight: body.shippingWeight ? parseFloat(body.shippingWeight) : null,
        shippingVolume: body.shippingVolume ? parseFloat(body.shippingVolume) : null,
        shippingTime: body.shippingTime || null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        isBestSeller: body.isBestSeller ?? false,
        isNew: body.isNew ?? false,
        publishStatus: body.publishStatus || 'active',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        // SEO fields
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        focusKeyword: body.focusKeyword || null,
        canonicalUrl: body.canonicalUrl || null,
        noindex: body.noindex ?? false,
        nofollow: body.nofollow ?? false,
        // Open Graph
        ogTitle: body.ogTitle || null,
        ogDescription: body.ogDescription || null,
        ogImage: body.ogImage || null,
        // Twitter
        twitterTitle: body.twitterTitle || null,
        twitterDescription: body.twitterDescription || null,
        twitterImage: body.twitterImage || null,
        // Schema
        schemaEnabled: body.schemaEnabled ?? true,
        gtin: body.gtin || null,
        mpn: body.mpn || null,
        schemaCondition: body.schemaCondition || 'NewCondition',
        schemaAvailability: body.schemaAvailability || 'InStock',
        // Relations
        brandId: body.brandId || null,
        categoryId: body.categoryId || null,
        storeId: body.storeId || null,
        // Attributes
        attributes: {
          create: attributes.filter((a: any) => a.name && a.value).map((a: any) => ({
            name: a.name,
            value: a.value,
          })),
        },
      },
      include: { attributes: true, images: true },
    })

    // Handle images if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      await db.productImage.createMany({
        data: body.images.map((img: any, idx: number) => ({
          url: img.url,
          alt: img.alt || null,
          sortOrder: idx,
          productId: product.id,
        })),
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
