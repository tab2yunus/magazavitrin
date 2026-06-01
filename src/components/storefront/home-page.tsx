'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Store, Users } from 'lucide-react'
import ProductCard from './product-card'
import type { Product, Category, Store as StoreType, Brand, Banner, Campaign } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function HomePage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bannersRes, campaignsRes, catRes, storeRes, bestRes, newRes, featRes, brandRes] = await Promise.all([
        fetch('/api/banners?active=true'),
        fetch('/api/campaigns?active=true'),
        fetch('/api/categories'),
        fetch('/api/stores'),
        fetch('/api/products?bestSeller=true&limit=8'),
        fetch('/api/products?new=true&limit=8'),
        fetch('/api/products?featured=true&limit=8'),
        fetch('/api/brands'),
      ])
      
      const [bannersData, campaignsData, catData, storeData, bestData, newData, featData, brandData] = await Promise.all([
        bannersRes.json(),
        campaignsRes.json(),
        catRes.json(),
        storeRes.json(),
        bestRes.json(),
        newRes.json(),
        featRes.json(),
        brandRes.json(),
      ])

      setBanners(Array.isArray(bannersData) ? bannersData.filter((b: Banner) => b.position === 'home_slider') : [])
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      setStores(Array.isArray(storeData) ? storeData : [])
      setBestSellers(bestData.products || [])
      setNewProducts(newData.products || [])
      setFeaturedProducts(featData.products || [])
      setBrands(Array.isArray(brandData) ? brandData : [])
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <Skeleton className="w-full h-[300px] rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
      {/* Hero Banner Slider */}
      {banners.length > 0 && (
        <div className="relative rounded-xl overflow-hidden group">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full shrink-0">
                <div className="relative aspect-[3/1] sm:aspect-[4/1]">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold">{banner.title}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Campaign Boxes */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={campaign.link ? `/ara?q=${encodeURIComponent(campaign.title)}` : `/ara?q=${encodeURIComponent(campaign.title)}`}
              className="relative rounded-xl overflow-hidden group cursor-pointer border border-gray-100 hover:shadow-md transition-shadow block"
            >
              {campaign.image ? (
                <img src={campaign.image} alt={campaign.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-[#F27A1A] to-[#D4630E] flex items-center justify-center p-4">
                  <div className="text-white text-center">
                    <h3 className="font-bold text-lg">{campaign.title}</h3>
                    {campaign.discountText && (
                      <p className="text-sm opacity-90 mt-1">{campaign.discountText}</p>
                    )}
                  </div>
                </div>
              )}
              {campaign.discountText && campaign.image && (
                <div className="absolute top-2 right-2 bg-[#E74C3C] text-white text-xs font-bold px-2 py-1 rounded">
                  {campaign.discountText}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Popular Categories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">Popüler Kategoriler</h2>
            <Button variant="ghost" className="text-[#F27A1A] text-sm">
              Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#FFF3E8] transition-colors group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFF3E8] group-hover:bg-white flex items-center justify-center text-2xl shadow-sm transition-colors">
                  {cat.icon || '📦'}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Stores */}
      {stores.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">Öne Çıkan Mağazalar</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {stores.slice(0, 8).map((store) => (
                <Link
                  key={store.id}
                  href={`/magaza/${store.slug}`}
                  className="inline-flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#F27A1A] hover:shadow-md transition-all min-w-[160px] shrink-0"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center text-xl font-bold text-[#F27A1A]">
                    {store.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      store.name[0]
                    )}
                  </div>
                  <span className="font-semibold text-sm text-[#1A2744]">{store.name}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="text-[#F27A1A]">★</span>
                    <span>{store.rating}</span>
                    <span>·</span>
                    <Users className="h-3 w-3" />
                    <span>{store.followerCount.toLocaleString('tr-TR')}</span>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">Çok Satan Ürünler</h2>
            <Button
              variant="ghost"
              onClick={() => router.push(`/ara?q=${encodeURIComponent('çok satan')}`)}
              className="text-[#F27A1A] text-sm"
            >
              Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">Yeni Ürünler</h2>
            <Button
              variant="ghost"
              onClick={() => router.push(`/ara?q=${encodeURIComponent('yeni')}`)}
              className="text-[#F27A1A] text-sm"
            >
              Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured/Discounted Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">İndirimli Ürünler</h2>
            <Button
              variant="ghost"
              onClick={() => router.push(`/ara?q=${encodeURIComponent('indirim')}`)}
              className="text-[#F27A1A] text-sm"
            >
              Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A2744]">Markalar</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/marka/${brand.slug}`}
                  className="inline-flex items-center justify-center px-6 py-4 rounded-xl border border-gray-100 hover:border-[#F27A1A] hover:shadow-md transition-all min-w-[140px] shrink-0"
                >
                  <span className="font-bold text-sm text-[#1A2744]">{brand.name}</span>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}
    </div>
  )
}
