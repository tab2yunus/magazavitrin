import { Metadata } from 'next'
import { db } from '@/lib/db'
import { generatePageMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo'
import ProductDetailClient from './product-detail-client'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await db.product.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        store: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!product) return { title: 'Ürün - MağazaVitrin' }

    const title = product.seoTitle || product.name
    const description = product.seoDescription || product.shortDescription || product.description?.substring(0, 160) || ''
    const image = product.ogImage || product.images?.[0]?.url || undefined
    const canonical = product.canonicalUrl || `/urun/${slug}`

    return generatePageMetadata({
      pageType: 'product',
      title,
      description,
      keywords: [product.name, product.brand?.name, product.category?.name, 'motosiklet', 'yedek parça', product.focusKeyword].filter(Boolean) as string[],
      image,
      url: canonical.startsWith('http') ? canonical : undefined,
      variables: {
        PRODUCT_NAME: product.name,
        BRAND_NAME: product.brand?.name || '',
        CATEGORY_NAME: product.category?.name || '',
        STORE_NAME: product.store?.name || '',
        PRICE: String(product.discountPrice || product.normalPrice),
        DESCRIPTION: product.shortDescription || product.description?.substring(0, 200) || '',
      },
      noindex: product.noindex,
      nofollow: product.nofollow,
    })
  } catch {
    return { title: 'Ürün - MağazaVitrin' }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  let product = null
  try {
    product = await db.product.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        store: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
  } catch { /* ignore */ }

  const jsonLd = product ? generateProductSchema({
    name: product.name,
    description: product.shortDescription || product.description?.substring(0, 500) || '',
    image: product.images?.[0]?.url || undefined,
    sku: product.sku || undefined,
    brand: product.brand?.name || undefined,
    price: product.discountPrice || product.normalPrice,
    currency: 'TRY',
    availability: product.schemaAvailability === 'InStock' ? 'https://schema.org/InStock'
      : product.schemaAvailability === 'OutOfStock' ? 'https://schema.org/OutOfStock'
      : product.schemaAvailability === 'PreOrder' ? 'https://schema.org/PreOrder'
      : 'https://schema.org/BackOrder',
    condition: product.schemaCondition === 'NewCondition' ? 'https://schema.org/NewCondition'
      : product.schemaCondition === 'UsedCondition' ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/RefurbishedCondition',
    gtin: product.gtin || undefined,
    mpn: product.mpn || undefined,
  }) : null

  // Breadcrumb schema
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Ana Sayfa', url: '/' },
  ]
  if (product?.category) {
    breadcrumbItems.push({ name: product.category.name, url: `/kategori/${product.category.slug}` })
  }
  if (product?.brand) {
    breadcrumbItems.push({ name: product.brand.name, url: `/marka/${slugify(product.brand.name)}` })
  }
  if (product) {
    breadcrumbItems.push({ name: product.name, url: `/urun/${product.slug}` })
  }
  const breadcrumbLd = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <>
      {jsonLd && product?.schemaEnabled !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient slug={slug} />
    </>
  )
}

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
