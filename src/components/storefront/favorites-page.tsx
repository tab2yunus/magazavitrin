'use client'

import { useState, useEffect } from 'react'
import { useRouterStore } from '@/stores/router-store'
import { useAuthStore } from '@/stores/auth-store'
import { Heart } from 'lucide-react'
import ProductCard from './product-card'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function FavoritesPage() {
  const { navigate } = useRouterStore()
  const { user, fetchUser, isLoading } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ page: 'login' })
    }
  }, [isLoading, user, navigate])

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const data = await res.json()
          const favProducts = Array.isArray(data) ? data.map((f: any) => f.product).filter(Boolean) : []
          setProducts(favProducts)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    if (user) loadFavorites()
  }, [user])

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#1A2744] mb-6">
        <Heart className="h-6 w-6 inline-block mr-2 text-[#E74C3C]" />
        Favorilerim ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A2744] mb-2">Favori ürününüz yok</h2>
          <p className="text-gray-500 mb-6">Beğendiğiniz ürünleri favorilere ekleyin!</p>
          <Button onClick={() => navigate({ page: 'home' })} className="bg-[#F27A1A] hover:bg-[#D4630E]">
            Alışverişe Başla
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
