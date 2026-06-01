'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import ProductCard from './product-card'
import type { Product, Category, Store as StoreType, Brand } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchPageProps {
  query: string
}

export default function SearchPage({ query }: SearchPageProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const loadResults = useCallback(async () => {
    if (!query) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setStores(data.stores || [])
        setCategories(data.categories || [])
        setBrands(data.brands || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [query])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[#F27A1A]">Ana Sayfa</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-800 font-medium">Arama</span>
      </nav>

      {/* Search query display */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2744]">
          &ldquo;{query}&rdquo; için arama sonuçları
        </h1>
        <p className="text-sm text-gray-500 mt-1">{products.length} ürün bulundu</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories, Brands, Stores */}
          <aside className="space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm text-[#1A2744] mb-3">Kategoriler</h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      className="w-full text-left text-sm text-gray-600 hover:text-[#F27A1A] py-1 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{cat.icon}</span> {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm text-[#1A2744] mb-3">Markalar</h3>
                <div className="space-y-1.5">
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/marka/${brand.slug}`}
                      className="w-full text-left text-sm text-gray-600 hover:text-[#F27A1A] py-1 block"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stores */}
            {stores.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm text-[#1A2744] mb-3">Mağazalar</h3>
                <div className="space-y-1.5">
                  {stores.map((store) => (
                    <Link
                      key={store.id}
                      href={`/magaza/${store.slug}`}
                      className="w-full text-left text-sm text-gray-600 hover:text-[#F27A1A] py-1 block"
                    >
                      {store.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products grid */}
          <main className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1A2744] mb-2">Sonuç Bulunamadı</h2>
                <p className="text-gray-500 mb-4">
                  &ldquo;{query}&rdquo; ile eşleşen ürün bulunamadı. Farklı bir arama deneyin.
                </p>
                <Button onClick={() => router.push('/')} className="bg-[#F27A1A] hover:bg-[#D4630E]">
                  Ana Sayfaya Dön
                </Button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
