'use client'

import CategoryPage from '@/components/storefront/category-page'

interface CategoryClientProps {
  slug: string
}

export default function CategoryClient({ slug }: CategoryClientProps) {
  return <CategoryPage slug={slug} />
}
