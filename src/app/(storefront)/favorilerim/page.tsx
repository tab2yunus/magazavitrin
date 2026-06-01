import { Metadata } from 'next'
import FavoritesClient from './favorites-client'

export const metadata: Metadata = {
  title: 'Favorilerim - MağazaVitrin',
  description: 'Favori ürünlerinizi görüntüleyin',
}

export default function FavoritesPage() {
  return <FavoritesClient />
}
