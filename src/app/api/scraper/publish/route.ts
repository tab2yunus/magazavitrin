import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper: slugify with Turkish char support
function slugify(str: string): string {
  return str
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper: generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  return slug
}

// Default markup percentage (30%)
const DEFAULT_MARKUP_PERCENT = 30

// POST /api/scraper/publish - Publish imported products to marketplace
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      mode = 'unpublished', // 'unpublished' | 'all' | 'selected'
      productIds,            // specific ImportedProduct IDs (for 'selected' mode)
      markupPercent = DEFAULT_MARKUP_PERCENT,
      storeId,               // optional: assign to specific store
    } = body

    // Build where clause
    const where: any = { sourceSupplier: 'MOTOLUX' }
    if (mode === 'unpublished') {
      where.isPublished = false
    } else if (mode === 'selected' && productIds?.length) {
      where.id = { in: productIds }
    }
    // mode === 'all' → no filter

    const importedProducts = await db.importedProduct.findMany({ where })

    if (importedProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Yayınlanacak ürün bulunamadı.',
        published: 0,
        skipped: 0,
        errors: 0,
      })
    }

    // Ensure MOTOLUX store exists
    let motoluxStoreId = storeId
    if (!motoluxStoreId) {
      const existingStore = await db.store.findFirst({ where: { slug: 'motolux' } })
      if (existingStore) {
        motoluxStoreId = existingStore.id
      } else {
        const newStore = await db.store.create({
          data: {
            name: 'MOTOLUX',
            slug: 'motolux',
            description: 'MOTOLUX motosiklet ve yedek parça',
            city: 'İstanbul',
            category: 'Otomotiv',
            isActive: true,
          },
        })
        motoluxStoreId = newStore.id
      }
    }

    let published = 0
    let skipped = 0
    let errors = 0
    const markupMultiplier = 1 + (markupPercent / 100)

    for (const imp of importedProducts) {
      try {
        // Skip already published
        if (imp.isPublished && imp.publishedProductId) {
          skipped++
          continue
        }

        // Find or create Category
        let categoryId: string | null = null
        if (imp.category) {
          const categorySlug = slugify(imp.category)
          const existingCat = await db.category.findFirst({ where: { slug: categorySlug } })
          if (existingCat) {
            categoryId = existingCat.id
          } else {
            const newCat = await db.category.create({
              data: {
                name: imp.category,
                slug: categorySlug,
                isActive: true,
              },
            })
            categoryId = newCat.id
          }
        }

        // Find or create Brand
        let brandId: string | null = null
        if (imp.brand) {
          const brandSlug = slugify(imp.brand)
          const existingBrand = await db.brand.findFirst({ where: { slug: brandSlug } })
          if (existingBrand) {
            brandId = existingBrand.id
          } else {
            const newBrand = await db.brand.create({
              data: {
                name: imp.brand,
                slug: brandSlug,
                isActive: true,
              },
            })
            brandId = newBrand.id
          }
        }

        // Calculate retail price with markup
        const normalPrice = Math.round(imp.supplierPrice * markupMultiplier * 100) / 100

        // Generate unique slug for product
        const baseSlug = slugify(imp.productName)
        const productSlug = await generateUniqueSlug(baseSlug || `urun-${imp.sourceProductId}`)

        // Create Product
        const product = await db.product.create({
          data: {
            name: imp.productName,
            slug: productSlug,
            sku: imp.sku || imp.sourceProductId,
            barcode: imp.barcode,
            description: imp.description || imp.productName,
            shortDescription: imp.description
              ? (imp.description.length > 120 ? imp.description.substring(0, 120) + '...' : imp.description)
              : null,
            normalPrice,
            stock: imp.stock,
            shippingTime: '1-3 İş Günü',
            isActive: imp.stock > 0, // Only activate if in stock
            isFeatured: false,
            isBestSeller: false,
            isNew: true,
            brandId,
            categoryId,
            storeId: motoluxStoreId,
          },
        })

        // Create ProductImages from imageUrls
        if (imp.imageUrls) {
          try {
            const urls: string[] = JSON.parse(imp.imageUrls)
            if (Array.isArray(urls) && urls.length > 0) {
              for (let i = 0; i < urls.length; i++) {
                await db.productImage.create({
                  data: {
                    url: urls[i],
                    alt: imp.productName,
                    sortOrder: i,
                    productId: product.id,
                  },
                })
              }
            }
          } catch {
            // Ignore image parse errors
          }
        }

        // Mark imported product as published
        await db.importedProduct.update({
          where: { id: imp.id },
          data: {
            isPublished: true,
            publishedProductId: product.id,
            publishedAt: new Date(),
          },
        })

        published++
      } catch (err) {
        console.error(`[PUBLISH] Error publishing ${imp.sourceProductId}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${published} ürün yayımlandı, ${skipped} atlandı (zaten yayımlanmış), ${errors} hata.`,
      published,
      skipped,
      errors,
      total: importedProducts.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/scraper/publish - Get publish status
export async function GET() {
  try {
    const [totalImported, totalPublished, totalUnpublished] = await Promise.all([
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX' } }),
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX', isPublished: true } }),
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX', isPublished: false } }),
    ])

    return NextResponse.json({
      totalImported,
      totalPublished,
      totalUnpublished,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
