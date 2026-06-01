'use client'

import StorePage from '@/components/storefront/store-page'

interface StoreClientProps {
  slug: string
}

export default function StoreClient({ slug }: StoreClientProps) {
  return <StorePage slug={slug} />
}
