'use client'

import BrandPage from '@/components/storefront/brand-page'

interface BrandClientProps {
  slug: string
}

export default function BrandClient({ slug }: BrandClientProps) {
  return <BrandPage slug={slug} />
}
