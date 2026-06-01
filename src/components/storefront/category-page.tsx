'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useBrand } from '@/lib/brand-context'
import ProductCard from './product-card'
import type { Product, Category, Brand } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CategoryPageProps {
  slug: string
}

export default function CategoryPage({ slug }: CategoryPageProps) {
  const router = useRouter()
  const { theme } = useBrand()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const loadCategory = useCallback(async () => {
    setLoading(true)
    try {
      // Load category info
      const catRes = await fetch('/api/categories?flat=true')
      if (catRes.ok) {
        const cats = await catRes.json()
        const cat = cats.find((c: Category) => c.slug === slug)
        setCategory(cat || null)
      }

      // Load products
      const params = new URLSearchParams({ category: slug, sort, limit: '24' })
      if (selectedBrands.length > 0) {
        selectedBrands.forEach((brandId) => {
          params.append('brand', brandId)
        })
      }
      if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]))
      if (priceRange[1] < 100000) params.set('maxPrice', String(priceRange[1]))

      const prodRes = await fetch(`/api/products?${params}`)
      if (prodRes.ok) {
        const data = await prodRes.json()
        setProducts(data.products || [])
        setTotalProducts(data.total || 0)

        // Extract brands from products
        const brandMap = new Map<string, Brand>()
        ;(data.products || []).forEach((p: Product) => {
          if (p.brand && !brandMap.has(p.brand.id)) brandMap.set(p.brand.id, p.brand)
        })
        setAllBrands(Array.from(brandMap.values()))
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [slug, sort, selectedBrands, priceRange])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  function toggleBrand(brandId: string) {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    )
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sub-categories */}
      {category?.children && category.children.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3">Alt Kategoriler</h3>
          <div className="space-y-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/kategori/${child.slug}`}
                className="w-full text-left text-sm text-gray-600 hover:text-[var(--color-primary)] py-1 flex items-center gap-2"
              >
                <span>{child.icon}</span>
                <span>{child.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Brand filter */}
      {allBrands.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3">Marka</h3>
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {allBrands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <span className="text-gray-600">{brand.name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3">Fiyat Aralığı</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100000}
          step={100}
          className="mt-2"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{new Intl.NumberFormat('tr-TR').format(priceRange[0])} TL</span>
          <span>{new Intl.NumberFormat('tr-TR').format(priceRange[1])} TL</span>
        </div>
      </div>

      {/* Selected filters */}
      {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-2">Seçili Filtreler</h3>
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map(brandId => {
              const brand = allBrands.find(b => b.id === brandId)
              return brand ? (
                <Badge key={brandId} variant="secondary" className="cursor-pointer" onClick={() => toggleBrand(brandId)}>
                  {brand.name} <X className="h-3 w-3 ml-1" />
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--color-primary)]">Ana Sayfa</Link>
        {category?.parent && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/kategori/${category.parent!.slug}`} className="hover:text-[var(--color-primary)]">
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--color-text)] font-medium">{category?.name || slug}</span>
      </nav>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border rounded-lg p-4 sticky top-24">
            <h2 className="font-bold text-[var(--color-text)] mb-4">Filtreler</h2>
            <FilterContent />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[var(--color-text)]">{totalProducts}</span> ürün bulundu
            </p>
            <div className="flex items-center gap-3">
              {/* Mobile filter */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtrele
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetTitle className="font-bold text-[var(--color-text)] mb-4">Filtreler</SheetTitle>
                  <FilterContent />
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">En Yeni</SelectItem>
                  <SelectItem value="price_asc">Fiyat Artan</SelectItem>
                  <SelectItem value="price_desc">Fiyat Azalan</SelectItem>
                  <SelectItem value="best_seller">En Çok Satan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Bu kategoride ürün bulunamadı.</p>
              <Button onClick={() => router.push('/')} className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
                Ana Sayfaya Dön
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
