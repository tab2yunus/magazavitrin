import { Metadata } from 'next'
import ComparisonsClient from './comparisons-client'

export const metadata: Metadata = {
  title: 'Karşılaştırma - MağazaVitrin',
  description: 'Ürünleri karşılaştırın',
}

export default function ComparisonsPage() {
  return <ComparisonsClient />
}
