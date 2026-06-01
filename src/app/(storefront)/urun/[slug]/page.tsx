import { Metadata } from 'next'
import { db } from '@/lib/db'
import ProductDetailClient from './product-detail-client'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    // Direct DB query - much faster than API call
    const product = await db.product.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!product) return { title: 'Ürün - MağazaVitrin' }

    return {
      title: `${product.name} - MağazaVitrin`,
      description: product.shortDescription || product.description?.substring(0, 160) || '',
      keywords: [product.name, product.brand?.name, product.category?.name, 'motosiklet', 'yedek parça'].filter(Boolean) as string[],
      openGraph: {
        title: product.name,
        description: product.shortDescription || '',
        images: product.images?.[0]?.url ? [{ url: product.images[0].url, alt: product.name }] : [],
        type: 'website',
      },
      alternates: {
        canonical: `/urun/${slug}`,
      },
    }
  } catch {
    return { title: 'Ürün - MağazaVitrin' }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  // Fetch product for server-side JSON-LD structured data (direct DB, no API)
  let product = null
  try {
    product = await db.product.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        store: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
  } catch { /* ignore */ }

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.substring(0, 500) || '',
    image: product.images?.map((img) => img.url) || [],
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.discountPrice || product.normalPrice,
      priceCurrency: 'TRY',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: product.store ? { '@type': 'Organization', name: product.store.name } : undefined,
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient slug={slug} />
    </>
  )
}
