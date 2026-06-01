'use client'

import ProductDetailPage from '@/components/storefront/product-detail-page'

interface ProductDetailClientProps {
  slug: string
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  return <ProductDetailPage slug={slug} />
}
