'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MapPin, Star, Users, ShoppingBag, MessageCircle } from 'lucide-react'
import ProductCard from './product-card'
import type { Store as StoreType, Product, StoreQuestion } from '@/types'
import { formatPrice } from '@/lib/storefront-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface StorePageProps {
  slug: string
}

export default function StorePage({ slug }: StorePageProps) {
  const router = useRouter()
  const [store, setStore] = useState<(StoreType & { products?: any[]; questions?: StoreQuestion[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')

  const loadStore = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setStore(data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [slug])

  useEffect(() => {
    loadStore()
  }, [loadStore])

  const products = store?.products || []
  const questions = store?.questions || []

  const sortedProducts = [...products].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return (a.discountPrice || a.normalPrice) - (b.discountPrice || b.normalPrice)
      case 'price_desc': return (b.discountPrice || b.normalPrice) - (a.discountPrice || a.normalPrice)
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default: return 0
    }
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
        <Skeleton className="h-24 w-full rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#0F1B2D]">Mağaza bulunamadı</h2>
        <Button onClick={() => router.push('/')} className="mt-4 bg-[#F27A1A] hover:bg-[#D4630E]">
          Ana Sayfaya Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[#F27A1A]">Ana Sayfa</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-800 font-medium">{store.name}</span>
      </nav>

      {/* Cover & Logo */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <div className="h-40 sm:h-56 bg-gradient-to-r from-[#0F1B2D] to-[#2D3F63]">
          {store.coverImage && (
            <img src={store.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-3xl font-bold text-[#F27A1A]">{store.name[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Store info */}
      <div className="mt-12 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1B2D]">{store.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {store.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {store.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-[#F27A1A] fill-[#F27A1A]" /> {store.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {store.followerCount.toLocaleString('tr-TR')} takipçi
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" /> {store.salesCount.toLocaleString('tr-TR')} satış
            </span>
          </div>
        </div>
        <Button variant="outline" className="shrink-0">
          <MessageCircle className="h-4 w-4 mr-1.5" /> Mağazaya Soru Sor
        </Button>
      </div>

      {store.description && (
        <p className="text-sm text-gray-600 mb-6 max-w-3xl">{store.description}</p>
      )}

      <Separator className="mb-6" />

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Ürünler ({products.length})</TabsTrigger>
          <TabsTrigger value="questions">Sorular ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-4">
          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#0F1B2D]">{products.length}</span> ürün
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price_asc">Fiyat Artan</SelectItem>
                <SelectItem value="price_desc">Fiyat Azalan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">Bu mağazada ürün bulunamadı.</p>
          )}
        </TabsContent>

        <TabsContent value="questions" className="pt-4">
          {questions.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {questions.map((q) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{q.user?.name || 'Anonim'}</span>
                    <span className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p className="text-sm text-[#0F1B2D]">{q.question}</p>
                  {q.isAnswered && q.answer && (
                    <div className="mt-3 pl-4 border-l-2 border-[#F27A1A]">
                      <p className="text-sm text-gray-600">{q.answer}</p>
                    </div>
                  )}
                  {!q.isAnswered && (
                    <Badge variant="outline" className="mt-2 text-xs text-yellow-600 border-yellow-300">
                      Beklemede
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">Henüz soru sorulmamış.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
