import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function toSearchable(str: string): string {
  return str
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .toLowerCase()
    .trim()
}

function toUpperCaseTurkish(str: string): string {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ş/g, 'Ş')
    .replace(/ç/g, 'Ç')
    .replace(/ü/g, 'Ü')
    .replace(/ö/g, 'Ö')
    .replace(/ğ/g, 'Ğ')
    .toUpperCase()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    if (!q || !q.trim()) return NextResponse.json({ products: [], stores: [], categories: [], brands: [] })

    const searchTerm = q.trim()
    const searchLower = toSearchable(searchTerm)

    // For SQLite, we need to search with multiple case variations
    // SQLite contains is case-sensitive for non-ASCII chars, so we use multiple approaches
    const searchVariants = [
      searchTerm,                     // Original: "afrika king"
      searchTerm.toUpperCase(),       // Uppercase: "AFRIKA KING"
      searchTerm.toLowerCase(),       // Lowercase: "afrika king"
      searchLower,                    // ASCII lowercase: "afrika king"
      toUpperCaseTurkish(searchTerm), // Turkish uppercase: "AFRİKA KİNG"
    ]

    // Remove duplicate variants to avoid unnecessary OR conditions
    const uniqueVariants = [...new Set(searchVariants)]

    // Build OR conditions for product search across name, description, sku, barcode, and category
    const productSearchConditions = uniqueVariants.flatMap(variant => [
      { name: { contains: variant } },
      { description: { contains: variant } },
      { sku: { contains: variant } },
      { barcode: { contains: variant } },
    ])

    // Also search by category name
    const categorySearchConditions = uniqueVariants.flatMap(variant => [
      { name: { contains: variant } },
    ])

    // Find matching category IDs first
    const matchingCategories = await db.category.findMany({
      where: {
        OR: categorySearchConditions,
        isActive: true,
      },
      select: { id: true },
    })
    const categoryIds = matchingCategories.map(c => c.id)

    // Add category ID conditions to product search if any categories match
    const allProductConditions = [...productSearchConditions]
    if (categoryIds.length > 0) {
      allProductConditions.push(...categoryIds.map(id => ({ categoryId: id })))
    }

    // Find matching brand IDs
    const brandSearchConditions = uniqueVariants.flatMap(variant => [
      { name: { contains: variant } },
    ])
    const matchingBrands = await db.brand.findMany({
      where: {
        OR: brandSearchConditions,
        isActive: true,
      },
      select: { id: true },
    })
    const brandIds = matchingBrands.map(b => b.id)

    if (brandIds.length > 0) {
      allProductConditions.push(...brandIds.map(id => ({ brandId: id })))
    }

    const [products, stores, categories, brands] = await Promise.all([
      db.product.findMany({
        where: {
          OR: allProductConditions,
          isActive: true,
        },
        include: {
          brand: true,
          store: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      db.store.findMany({
        where: {
          OR: uniqueVariants.flatMap(variant => [
            { name: { contains: variant } },
            { description: { contains: variant } },
          ]),
          isActive: true,
        },
        take: 10,
      }),
      db.category.findMany({
        where: {
          OR: categorySearchConditions,
          isActive: true,
        },
        take: 10,
      }),
      db.brand.findMany({
        where: {
          OR: uniqueVariants.flatMap(variant => [
            { name: { contains: variant } },
            { description: { contains: variant } },
          ]),
          isActive: true,
        },
        take: 10,
      }),
    ])

    // Calculate average rating for products
    const productsWithRating = products.map(p => {
      const reviews = (p as any).reviews || []
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0
      return { ...p, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
    })

    return NextResponse.json({ products: productsWithRating, stores, categories, brands })
  } catch (error: any) {
    console.error('[SEARCH] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
