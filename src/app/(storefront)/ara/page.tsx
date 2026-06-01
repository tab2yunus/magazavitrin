import { Metadata } from 'next'
import SearchClient from './search-client'

export const metadata: Metadata = {
  title: 'Arama - MağazaVitrin',
  description: 'Motosiklet yedek parça arayın',
}

export default function SearchPage() {
  return <SearchClient />
}
