'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Heart, BarChart3, Star, Truck, Shield, RotateCcw,
  ChevronRight, Minus, Plus, Store, Package, MessageCircle,
  Check, X, ZoomIn, Share2
} from 'lucide-react'
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
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const loadProduct = useCallback(async () => {
    setLoading(true)
    setSelectedImage(0)
    setQuantity(1)
    try {
      const res = await fetch(`/api/products/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        if (data.variations) {
          const initVars: Record<string, string> = {}
          data.variations.forEach((v: ProductVariation) => {
            if (!initVars[v.name] && v.stock > 0) initVars[v.name] = v.value
          })
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-16 h-16 rounded-lg" />)}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="w-20 h-20 mx-auto text-[#8C95A6] mb-4" />
        <h2 className="text-2xl font-bold text-[#0F1B2D] mb-2">Ürün bulunamadı</h2>
        <p className="text-[#4A5568] mb-6">Aradığınız ürün kaldırılmış veya geçici olarak mevcut olmayabilir.</p>
        <Button onClick={() => router.push('/')} className="bg-[#F27A1A] hover:bg-[#D4630E] text-white">
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

  const variationGroups: Record<string, ProductVariation[]> = {}
  variations.forEach((v: ProductVariation) => {
    if (!variationGroups[v.name]) variationGroups[v.name] = []
    variationGroups[v.name].push(v)
  })

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

  function handleImageZoom(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  async function handleAddToCart() {
    let variationId: string | undefined
    if (Object.keys(selectedVariations).length > 0) {
      if (Object.keys(variationGroups).length === 1) {
        const match = variations.find((v: ProductVariation) => {
          const [name, value] = Object.entries(selectedVariations)[0]
          return v.name === name && v.value === value
        })
        variationId = match?.id
      }
    }
    try {
      await addItem(product.id, quantity, variationId, selectedVariations)
      toast({ title: 'Sepete eklendi', description: product.name })
    } catch {
      toast({ title: 'Hata', description: 'Sepete eklenemedi. Lütfen giriş yapın.', variant: 'destructive' })
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link kopyalandı' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#8C95A6] mb-6 overflow-x-auto">
        <Link href="/" className="hover:text-[#F27A1A] transition-colors">Ana Sayfa</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-[#F27A1A] transition-colors">
              {product.category.parent?.name && `${product.category.parent.name} / `}
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[#0F1B2D] font-medium truncate">{product.name}</span>
      </nav>

      {/* Product main section - 3 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* LEFT: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div
            className="aspect-square rounded-2xl overflow-hidden bg-[#F4F5F7] relative cursor-zoom-in group"
            onMouseMove={handleImageZoom}
            onClick={() => setZoomed(!zoomed)}
          >
            {images[selectedImage] ? (
              <img
                src={proxyImageUrl(images[selectedImage].url)}
                alt={images[selectedImage].alt || product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2)' } : {}}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1B2D] text-white">
                <Package className="h-16 w-16 text-[#F27A1A] mb-3" />
                <p className="font-bold text-lg">İKİZ MOTOR</p>
                <p className="text-sm text-white/60">Görsel Hazırlanıyor</p>
              </div>
            )}
            {effectiveHasDiscount && (
              <Badge className="absolute top-4 left-4 bg-[#EF4444] text-white text-sm font-bold px-3 py-1 border-0 rounded-lg">
                %{effectiveDiscountPercent} İndirim
              </Badge>
            )}
            {/* Zoom hint */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-[#4A5568] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-3.5 w-3.5" />
              Büyüt
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id || i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                    i === selectedImage ? 'border-[#F27A1A] shadow-md shadow-[#F27A1A]/20' : 'border-[#E2E5EA] hover:border-[#F27A1A]/50'
                  }`}
                >
                  <img src={proxyImageUrl(img.url)} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE: Product Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Brand */}
          {product.brand && (
            <Link
              href={`/marka/${product.brand.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#F27A1A] font-semibold hover:underline uppercase tracking-wide"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1B2D] leading-tight">{product.name}</h1>

          {/* SKU / OEM */}
          {(product.sku || product.oemCode) && (
            <div className="flex items-center gap-3 text-sm">
              {product.sku && (
                <span className="text-[#8C95A6]">SKU: <span className="text-[#4A5568] font-mono">{product.sku}</span></span>
              )}
              {product.oemCode && (
                <Badge className="bg-[#FFF3E8] text-[#F27A1A] border-0 text-xs font-semibold">
                  OEM: {product.oemCode}
                </Badge>
              )}
            </div>
          )}

          {/* Store info */}
          {product.store && (
            <div className="flex items-center gap-2">
              <Link
                href={`/magaza/${product.store.slug}`}
                className="text-sm text-[#4A5568] hover:text-[#F27A1A] flex items-center gap-1.5 transition-colors"
              >
                <Store className="h-4 w-4" />
                {product.store.name}
              </Link>
              <span className="text-sm text-[#F27A1A]">★ {product.store.rating}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'fill-[#F27A1A] text-[#F27A1A]' : 'text-[#E2E5EA]'}`}
                />
              ))}
            </div>
            <span className="text-sm text-[#4A5568]">({reviews.length} değerlendirme)</span>
          </div>

          <Separator className="bg-[#E2E5EA]" />

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-[#4A5568] leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Variations */}
          {Object.entries(variationGroups).map(([name, options]) => (
            <div key={name}>
              <p className="text-sm font-semibold text-[#0F1B2D] mb-2">
                {name}: <span className="font-normal text-[#4A5568]">{selectedVariations[name]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt: ProductVariation) => (
                  <Button
                    key={opt.id}
                    variant={selectedVariations[name] === opt.value ? 'default' : 'outline'}
                    size="sm"
                    disabled={opt.stock <= 0}
                    onClick={() => setSelectedVariations({ ...selectedVariations, [name]: opt.value })}
                    className={selectedVariations[name] === opt.value
                      ? 'bg-[#F27A1A] hover:bg-[#D4630E] text-white border-[#F27A1A]'
                      : 'border-[#E2E5EA] text-[#4A5568] hover:border-[#F27A1A] hover:text-[#F27A1A]'
                    }
                  >
                    {opt.value}
                    {opt.stock <= 0 && ' (Tükendi)'}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Uyumluluk Bilgisi */}
          <div className="bg-[#F4F5F7] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#0F1B2D] mb-2">Uyumluluk Bilgisi</p>
            <p className="text-xs text-[#8C95A6]">Bu parçanın uyumlu olduğu modeller için teknik özellikler sekmesini inceleyin.</p>
          </div>
        </div>

        {/* RIGHT: Price Box (3 cols) */}
        <div className="lg:col-span-3">
          <div className="sticky top-28 border border-[#E2E5EA] rounded-2xl overflow-hidden">
            {/* Price section */}
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                {effectiveHasDiscount && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#EF4444] text-white border-0 text-sm px-2">%{effectiveDiscountPercent}</Badge>
                    <span className="text-base text-[#8C95A6] line-through">{formatPrice(product.normalPrice)}</span>
                  </div>
                )}
                <span className="text-3xl font-bold text-[#F27A1A]">{formatPrice(currentPrice)}</span>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                {effectiveStock > 0 ? (
                  <Badge className="bg-[#ECFDF5] text-[#10B981] border-0 gap-1">
                    <Check className="h-3 w-3" />
                    Stokta {effectiveStock} adet
                  </Badge>
                ) : (
                  <Badge className="bg-[#FEF2F2] text-[#EF4444] border-0 gap-1">
                    <X className="h-3 w-3" />
                    Stokta yok
                  </Badge>
                )}
              </div>

              {/* Shipping info */}
              {effectiveStock > 0 && (
                <div className="space-y-2 pt-1">
                  {product.shippingTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-[#10B981]" />
                      <span className="text-[#4A5568]">{product.shippingTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-[#10B981]" />
                    <span className="text-[#4A5568]">Güvenli Ödeme</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <RotateCcw className="h-4 w-4 text-[#10B981]" />
                    <span className="text-[#4A5568]">14 Gün İade</span>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-[#E2E5EA]" />

            {/* Quantity + Add to cart */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#0F1B2D]">Adet:</span>
                <div className="flex items-center border border-[#E2E5EA] rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#4A5568]"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium text-[#0F1B2D]">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#4A5568]"
                    onClick={() => setQuantity(Math.min(effectiveStock || 99, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={effectiveStock <= 0}
                className="w-full h-12 text-base font-bold bg-[#F27A1A] hover:bg-[#D4630E] text-white shadow-lg shadow-[#F27A1A]/20"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sepete Ekle
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 border-[#E2E5EA] text-[#4A5568] hover:text-[#EF4444] hover:border-[#EF4444]"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${isFavorite(product.id) ? 'fill-[#EF4444] text-[#EF4444]' : ''}`} />
                  Favori
                </Button>
                <Button
                  variant="outline"
                  className="h-10 border-[#E2E5EA] text-[#4A5568] hover:text-[#F27A1A] hover:border-[#F27A1A]"
                  onClick={() => toggleComparison(product.id)}
                >
                  <BarChart3 className={`h-4 w-4 mr-1.5 ${isComparing(product.id) ? 'text-[#F27A1A]' : ''}`} />
                  Karşılaştır
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full h-10 border-[#E2E5EA] text-[#10B981] hover:bg-[#ECFDF5] hover:border-[#10B981]"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + window.location.href)}`, '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                WhatsApp ile Sor
              </Button>

              <Button
                variant="ghost"
                className="w-full h-8 text-[#8C95A6] text-xs"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="w-full justify-start bg-transparent border-b border-[#E2E5EA] rounded-none h-auto p-0">
          <TabsTrigger value="description" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-[#4A5568] data-[state=active]:text-[#0F1B2D]">
            Ürün Açıklaması
          </TabsTrigger>
          <TabsTrigger value="specs" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-[#4A5568] data-[state=active]:text-[#0F1B2D]">
            Teknik Özellikler
          </TabsTrigger>
          <TabsTrigger value="reviews" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#F27A1A] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-[#4A5568] data-[state=active]:text-[#0F1B2D]">
            Yorumlar ({reviews.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-6">
          <div className="prose prose-sm max-w-none text-[#4A5568]" dangerouslySetInnerHTML={{ __html: product.description || '<p>Bu ürün için açıklama bulunmamaktadır.</p>' }} />
        </TabsContent>
        <TabsContent value="specs" className="pt-6">
          {attributes.length > 0 ? (
            <div className="border border-[#E2E5EA] rounded-xl overflow-hidden max-w-2xl">
              <table className="w-full">
                <tbody>
                  {attributes.map((attr: any, i: number) => (
                    <tr key={attr.id || i} className={i % 2 === 0 ? 'bg-[#F4F5F7]' : 'bg-white'}>
                      <td className="px-5 py-3.5 text-sm font-medium text-[#0F1B2D] w-1/3">{attr.name}</td>
                      <td className="px-5 py-3.5 text-sm text-[#4A5568]">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#8C95A6]">Bu ürün için teknik özellik bulunmamaktadır.</p>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="pt-6">
          {reviews.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {reviews.map((review: Review & { user?: { name: string } }) => (
                <div key={review.id} className="border border-[#E2E5EA] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F27A1A] flex items-center justify-center text-white text-xs font-bold">
                        {(review.user?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#0F1B2D]">{review.user?.name || 'Anonim'}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-[#F27A1A] text-[#F27A1A]' : 'text-[#E2E5EA]'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#8C95A6]">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {review.title && <h4 className="font-medium text-sm mb-1 text-[#0F1B2D]">{review.title}</h4>}
                  {review.comment && <p className="text-sm text-[#4A5568]">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto text-[#E2E5EA] mb-3" />
              <p className="text-[#8C95A6]">Bu ürün için henüz yorum yapılmamış.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#0F1B2D] mb-4">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {similarProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Store Products */}
      {storeProducts.length > 0 && product.store && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#0F1B2D] mb-4">
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
