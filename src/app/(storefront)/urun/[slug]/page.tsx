import { Metadata } from 'next'
import ProductDetailClient from './product-detail-client'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'Ürün - MağazaVitrin' }
    
    const product = await res.json()
    
    return {
      title: product.name ? `${product.name} - MağazaVitrin` : 'Ürün - MağazaVitrin',
      description: product.shortDescription || product.description?.substring(0, 160) || '',
      keywords: [product.name, product.brand?.name, product.category?.name, 'motosiklet', 'yedek parça'].filter(Boolean),
      openGraph: {
        title: product.name || 'Ürün - MağazaVitrin',
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
  
  // Fetch product for server-side JSON-LD structured data
  let product = null
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { next: { revalidate: 3600 } })
    if (res.ok) product = await res.json()
  } catch { /* ignore */ }

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.substring(0, 500) || '',
    image: product.images?.map((img: any) => img.url) || [],
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.discountPrice || product.normalPrice,
      priceCurrency: 'TRY',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: product.store ? { '@type': 'Organization', name: product.store.name } : undefined,
    },
    aggregateRating: product.avgRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviews?.length || 0,
    } : undefined,
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
