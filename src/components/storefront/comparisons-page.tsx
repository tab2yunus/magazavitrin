'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useComparisonStore } from '@/stores/favorites-store'
import { BarChart3, X, Trash2 } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/storefront-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ComparisonsPage() {
  const router = useRouter()
  const { user, fetchUser, isLoading } = useAuthStore()
  const { clearComparisons, toggleComparison, fetchComparisons } = useComparisonStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/giris')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    async function loadComparisons() {
      try {
        const res = await fetch('/api/comparisons')
        if (res.ok) {
          const data = await res.json()
          const compProducts = Array.isArray(data) ? data.map((c: any) => c.product).filter(Boolean) : []
          setProducts(compProducts)
        }
        // Sync store state with server
        await fetchComparisons()
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    if (user) loadComparisons()
  }, [user, fetchComparisons])

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  // Collect all attribute names
  const allAttributeNames = new Set<string>()
  products.forEach((p) => {
    ;(p as any).attributes?.forEach((a: any) => allAttributeNames.add(a.name))
  })
  const attributeList = Array.from(allAttributeNames)

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F1B2D]">
          <BarChart3 className="h-6 w-6 inline-block mr-2 text-purple-600" />
          Karşılaştırma ({products.length}/4)
        </h1>
        {products.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearComparisons}>
            <Trash2 className="h-4 w-4 mr-1" /> Tümünü Temizle
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0F1B2D] mb-2">Karşılaştırma listeniz boş</h2>
          <p className="text-gray-500 mb-6">Ürün detay sayfasından karşılaştırmaya ekleyin!</p>
          <Button onClick={() => router.push('/')} className="bg-[#F27A1A] hover:bg-[#D4630E]">
            Alışverişe Başla
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500 bg-gray-50 rounded-tl-lg w-32">Özellik</th>
                {products.map((product) => (
                  <th key={product.id} className="p-3 bg-gray-50 text-center min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => toggleComparison(product.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </button>
                      <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-[#F4F5F7] mb-2">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                        )}
                      </div>
                      <Link
                        href={`/urun/${product.slug}`}
                        className="text-sm font-medium text-[#0F1B2D] hover:text-[#F27A1A] line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 text-sm font-medium text-gray-500 bg-gray-50">Fiyat</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <span className="font-bold text-[#F27A1A]">
                      {formatPrice(product.discountPrice || product.normalPrice)}
                    </span>
                    {product.discountPrice && (
                      <span className="block text-xs text-gray-400 line-through">{formatPrice(product.normalPrice)}</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-sm font-medium text-gray-500 bg-gray-50">Marka</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm">
                    {product.brand?.name || '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-sm font-medium text-gray-500 bg-gray-50">Kategori</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm">
                    {product.category?.name || '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-sm font-medium text-gray-500 bg-gray-50">Stok</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm">
                    {product.stock > 0 ? (
                      <span className="text-[#10B981]">Stokta ({product.stock})</span>
                    ) : (
                      <span className="text-[#EF4444]">Tükendi</span>
                    )}
                  </td>
                ))}
              </tr>
              {attributeList.map((attrName) => (
                <tr key={attrName} className="border-t">
                  <td className="p-3 text-sm font-medium text-gray-500 bg-gray-50">{attrName}</td>
                  {products.map((product) => {
                    const attr = (product as any).attributes?.find((a: any) => a.name === attrName)
                    return (
                      <td key={product.id} className="p-3 text-center text-sm">
                        {attr?.value || '-'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
