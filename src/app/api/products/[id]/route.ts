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

// PUT /api/products/[id] - Update product with all fields
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate discount price
    const normalPrice = body.normalPrice !== undefined ? parseFloat(body.normalPrice) : undefined
    const discountPrice = body.discountPrice !== undefined ? (body.discountPrice ? parseFloat(body.discountPrice) : null) : undefined

    if (normalPrice !== undefined && discountPrice !== null && discountPrice !== undefined && discountPrice > normalPrice) {
      return NextResponse.json({ error: 'İndirimli fiyat normal fiyattan yüksek olamaz' }, { status: 400 })
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug) {
      const existing = await db.product.findFirst({ where: { slug: body.slug, id: { not: id } } })
      if (existing) {
        return NextResponse.json({ error: 'Bu slug zaten kullanılıyor', slug: body.slug }, { status: 409 })
      }
    }

    // Build update data
    const updateData: any = {}

    // Only include fields that are present in the body
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.sku !== undefined) updateData.sku = body.sku || null
    if (body.barcode !== undefined) updateData.barcode = body.barcode || null
    if (body.oemCode !== undefined) updateData.oemCode = body.oemCode || null
    if (body.productCode !== undefined) updateData.productCode = body.productCode || null
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription || null
    if (body.normalPrice !== undefined) updateData.normalPrice = parseFloat(body.normalPrice)
    if (body.discountPrice !== undefined) updateData.discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock) || 0
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus
    if (body.criticalStock !== undefined) updateData.criticalStock = parseInt(body.criticalStock) || 5
    if (body.shippingWeight !== undefined) updateData.shippingWeight = body.shippingWeight ? parseFloat(body.shippingWeight) : null
    if (body.shippingVolume !== undefined) updateData.shippingVolume = body.shippingVolume ? parseFloat(body.shippingVolume) : null
    if (body.shippingTime !== undefined) updateData.shippingTime = body.shippingTime || null
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured
    if (body.isBestSeller !== undefined) updateData.isBestSeller = body.isBestSeller
    if (body.isNew !== undefined) updateData.isNew = body.isNew
    if (body.publishStatus !== undefined) updateData.publishStatus = body.publishStatus
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    // SEO
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null
    if (body.focusKeyword !== undefined) updateData.focusKeyword = body.focusKeyword || null
    if (body.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl || null
    if (body.noindex !== undefined) updateData.noindex = body.noindex
    if (body.nofollow !== undefined) updateData.nofollow = body.nofollow
    // OG
    if (body.ogTitle !== undefined) updateData.ogTitle = body.ogTitle || null
    if (body.ogDescription !== undefined) updateData.ogDescription = body.ogDescription || null
    if (body.ogImage !== undefined) updateData.ogImage = body.ogImage || null
    // Twitter
    if (body.twitterTitle !== undefined) updateData.twitterTitle = body.twitterTitle || null
    if (body.twitterDescription !== undefined) updateData.twitterDescription = body.twitterDescription || null
    if (body.twitterImage !== undefined) updateData.twitterImage = body.twitterImage || null
    // Schema
    if (body.schemaEnabled !== undefined) updateData.schemaEnabled = body.schemaEnabled
    if (body.gtin !== undefined) updateData.gtin = body.gtin || null
    if (body.mpn !== undefined) updateData.mpn = body.mpn || null
    if (body.schemaCondition !== undefined) updateData.schemaCondition = body.schemaCondition
    if (body.schemaAvailability !== undefined) updateData.schemaAvailability = body.schemaAvailability
    // Relations
    if (body.brandId !== undefined) updateData.brandId = body.brandId || null
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null
    if (body.storeId !== undefined) updateData.storeId = body.storeId || null

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

    // Handle attributes update if provided
    if (body.attributes !== undefined) {
      // Delete existing attributes
      await db.productAttribute.deleteMany({ where: { productId: id } })
      // Create new attributes
      const validAttrs = body.attributes.filter((a: any) => a.name && a.value)
      if (validAttrs.length > 0) {
        await db.productAttribute.createMany({
          data: validAttrs.map((a: any) => ({
            name: a.name,
            value: a.value,
            productId: id,
          })),
        })
      }
    }

    // Handle images update if provided
    if (body.images !== undefined) {
      // Delete existing images
      await db.productImage.deleteMany({ where: { productId: id } })
      // Create new images
      const validImages = body.images.filter((img: any) => img.url)
      if (validImages.length > 0) {
        await db.productImage.createMany({
          data: validImages.map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || null,
            sortOrder: idx,
            productId: id,
          })),
        })
      }
    }

    // Return updated product with relations
    const updatedProduct = await db.product.findFirst({
      where: { id },
      include: {
        brand: true,
        category: true,
        store: true,
        images: { orderBy: { sortOrder: 'asc' } },
        attributes: true,
      },
    })

    return NextResponse.json(updatedProduct)
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
