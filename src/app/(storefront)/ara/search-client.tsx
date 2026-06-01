'use client'

import { useSearchParams } from 'next/navigation'
import SearchPage from '@/components/storefront/search-page'

export default function SearchClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  return <SearchPage query={query} />
}
