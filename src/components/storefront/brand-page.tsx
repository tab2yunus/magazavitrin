'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ProductCard from './product-card'
import type { Brand, Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface BrandPageProps {
  slug: string
}

export default function BrandPage({ slug }: BrandPageProps) {
  const router = useRouter()
  const [brand, setBrand] = useState<Brand & { products?: Product[] } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')

  const loadBrand = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/brands/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setBrand(data)
        setProducts(data.products || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [slug])

  useEffect(() => {
    loadBrand()
  }, [loadBrand])

  // Sort products client-side for brand page since API doesn't support sort for brand products
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
        <Skeleton className="h-24 w-full rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A2744]">Marka bulunamadı</h2>
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
        <span className="text-gray-800 font-medium">{brand.name}</span>
      </nav>

      {/* Brand header */}
      <div className="bg-white border rounded-xl p-6 mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-3xl font-bold text-[#F27A1A]">{brand.name[0]}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">{brand.name}</h1>
          {brand.description && <p className="text-sm text-gray-500 mt-1">{brand.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{products.length} ürün</p>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-[#1A2744]">{products.length}</span> ürün
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

      {/* Products */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">Bu markada ürün bulunamadı.</p>
        </div>
      )}
    </div>
  )
}
