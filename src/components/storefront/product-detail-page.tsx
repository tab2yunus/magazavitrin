'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Heart, BarChart3, Star, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus, Store } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useFavoritesStore, useComparisonStore } from '@/stores/favorites-store'
import type { Product, ProductVariation, Review } from '@/types'
import { formatPrice, getDiscountPercent, proxyImageUrl } from '@/lib/storefront-utils'
import ProductCard from './product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface ProductDetailPageProps {
  slug: string
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { toggleComparison, isComparing } = useComparisonStore()
  const { toast } = useToast()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({})

  const loadProduct = useCallback(async () => {
    setLoading(true)
    setSelectedImage(0)
    setQuantity(1)
    try {
      const res = await fetch(`/api/products/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        // Initialize first in-stock variation per group
        if (data.variations) {
          const initVars: Record<string, string> = {}
          data.variations.forEach((v: ProductVariation) => {
            if (!initVars[v.name] && v.stock > 0) initVars[v.name] = v.value
          })
          // Fallback: if all variations of a group are out of stock, pick the first one
          data.variations.forEach((v: ProductVariation) => {
            if (!initVars[v.name]) initVars[v.name] = v.value
          })
          setSelectedVariations(initVars)
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [slug])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A2744]">Ürün bulunamadı</h2>
        <Button onClick={() => router.push('/')} className="mt-4 bg-[#F27A1A] hover:bg-[#D4630E]">
          Ana Sayfaya Dön
        </Button>
      </div>
    )
  }

  const images = product.images || []
  const variations = product.variations || []
  const attributes = product.attributes || []
  const reviews = product.reviews || []
  const similarProducts = product.similarProducts || []
  const storeProducts = product.storeProducts || []
  const avgRating = product.avgRating || 0

  // Group variations by name
  const variationGroups: Record<string, ProductVariation[]> = {}
  variations.forEach((v: ProductVariation) => {
    if (!variationGroups[v.name]) variationGroups[v.name] = []
    variationGroups[v.name].push(v)
  })

  // Find the currently selected variation (for price/stock override)
  const selectedVariation = Object.keys(variationGroups).length === 1
    ? variations.find((v: ProductVariation) => {
        const [name, value] = Object.entries(selectedVariations)[0]
        return v.name === name && v.value === value
      })
    : null

  const currentPrice = selectedVariation?.price || product.discountPrice || product.normalPrice
  const effectiveStock = selectedVariation?.stock ?? product.stock
  const effectiveHasDiscount = product.discountPrice
    ? product.discountPrice < product.normalPrice
    : !!selectedVariation?.price && selectedVariation.price < product.normalPrice
  const effectiveDiscountPercent = effectiveHasDiscount
    ? getDiscountPercent(product.normalPrice, currentPrice)
    : 0

  async function handleAddToCart() {
    // Find matching variation IDs per group
    let variationId: string | undefined
    if (Object.keys(selectedVariations).length > 0) {
      if (Object.keys(variationGroups).length === 1) {
        // Single variation group: find the exact matching variation
        const match = variations.find((v: ProductVariation) => {
          const [name, value] = Object.entries(selectedVariations)[0]
          return v.name === name && v.value === value
        })
        variationId = match?.id
      }
      // For multi-variation products, send selectedVariations to let
      // the backend resolve the correct combination
    }
    try {
      await addItem(product.id, quantity, variationId, selectedVariations)
      toast({ title: 'Sepete eklendi', description: product.name })
    } catch {
      toast({ title: 'Hata', description: 'Sepete eklenemedi. Lütfen giriş yapın.', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto">
        <Link href="/" className="hover:text-[#F27A1A]">Ana Sayfa</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-[#F27A1A]">
              {product.category.parent?.name && `${product.category.parent.name} > `}
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product main section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] relative">
            {images[selectedImage] ? (
              <img
                src={proxyImageUrl(images[selectedImage].url)}
                alt={images[selectedImage].alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCart className="h-16 w-16" />
              </div>
            )}
            {effectiveHasDiscount && (
              <Badge className="absolute top-4 left-4 bg-[#E74C3C] text-white text-base font-bold px-3 py-1 border-0">
                %{effectiveDiscountPercent} İndirim
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id || i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    i === selectedImage ? 'border-[#F27A1A]' : 'border-gray-200'
                  }`}
                >
                  <img src={proxyImageUrl(img.url)} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product info */}
        <div className="space-y-4">
          {/* Brand */}
          {product.brand && (
            <Link
              href={`/marka/${product.brand.slug}`}
              className="text-sm text-[#F27A1A] font-semibold hover:underline"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">{product.name}</h1>

          {/* Store info */}
          {product.store && (
            <div className="flex items-center gap-2">
              <Link
                href={`/magaza/${product.store.slug}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Store className="h-4 w-4" />
                {product.store.name}
              </Link>
              <span className="text-sm text-gray-400">· {product.store.rating} ★</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'fill-[#F27A1A] text-[#F27A1A]' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} değerlendirme)</span>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-1">
            {effectiveHasDiscount && (
              <div className="flex items-center gap-2">
                <Badge className="bg-[#E74C3C] text-white border-0 text-sm">%{effectiveDiscountPercent}</Badge>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.normalPrice)}</span>
              </div>
            )}
            <span className="text-3xl font-bold text-[#F27A1A]">{formatPrice(currentPrice)}</span>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {effectiveStock > 0 ? (
              <>
                <Badge variant="outline" className="text-[#3CB371] border-[#3CB371] bg-green-50">
                  <Shield className="h-3 w-3 mr-1" /> Stokta {effectiveStock} adet
                </Badge>
                {product.shippingTime && (
                  <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                    <Truck className="h-3 w-3 mr-1" /> {product.shippingTime}
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="outline" className="text-[#E74C3C] border-[#E74C3C]">Stokta yok</Badge>
            )}
          </div>

          {/* Variations */}
          {Object.entries(variationGroups).map(([name, options]) => (
            <div key={name}>
              <p className="text-sm font-semibold text-[#1A2744] mb-2">{name}: <span className="font-normal text-gray-600">{selectedVariations[name]}</span></p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt: ProductVariation) => (
                  <Button
                    key={opt.id}
                    variant={selectedVariations[name] === opt.value ? 'default' : 'outline'}
                    size="sm"
                    disabled={opt.stock <= 0}
                    onClick={() => setSelectedVariations({ ...selectedVariations, [name]: opt.value })}
                    className={selectedVariations[name] === opt.value ? 'bg-[#F27A1A] hover:bg-[#D4630E] text-white' : ''}
                  >
                    {opt.value}
                    {opt.stock <= 0 && ' (Tükendi)'}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1A2744]">Adet:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={effectiveStock <= 0}
              className="w-full h-12 text-base font-bold bg-[#F27A1A] hover:bg-[#D4630E] text-white"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sepete Ekle
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isFavorite(product.id) ? 'fill-[#E74C3C] text-[#E74C3C]' : ''}`} />
                Favorilere Ekle
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => toggleComparison(product.id)}
              >
                <BarChart3 className={`h-4 w-4 mr-1.5 ${isComparing(product.id) ? 'text-[#F27A1A]' : ''}`} />
                Karşılaştır
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-[#3CB371]" />
              <span>Hızlı Kargo</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-[#3CB371]" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4 text-[#3CB371]" />
              <span>Kolay İade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
          <TabsTrigger value="description" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold">
            Ürün Açıklaması
          </TabsTrigger>
          <TabsTrigger value="specs" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold">
            Teknik Özellikler
          </TabsTrigger>
          <TabsTrigger value="reviews" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold">
            Yorumlar ({reviews.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-4">
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description || '<p>Bu ürün için açıklama bulunmamaktadır.</p>' }} />
        </TabsContent>
        <TabsContent value="specs" className="pt-4">
          {attributes.length > 0 ? (
            <div className="border rounded-lg overflow-hidden max-w-2xl">
              <table className="w-full">
                <tbody>
                  {attributes.map((attr: any, i: number) => (
                    <tr key={attr.id || i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A2744] w-1/3">{attr.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Bu ürün için teknik özellik bulunmamaktadır.</p>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          {reviews.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {reviews.map((review: Review & { user?: { name: string } }) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{review.user?.name || 'Anonim'}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-[#F27A1A] text-[#F27A1A]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {review.title && <h4 className="font-medium text-sm mb-1">{review.title}</h4>}
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Bu ürün için henüz yorum yapılmamış.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-[#1A2744] mb-4">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {similarProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Store Products */}
      {storeProducts.length > 0 && product.store && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-[#1A2744] mb-4">
            {product.store.name} Mağazasının Diğer Ürünleri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {storeProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
