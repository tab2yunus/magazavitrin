'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Heart, BarChart3, Star, Truck, Shield, RotateCcw,
  ChevronRight, ChevronLeft, Minus, Plus, Store, Package, MessageCircle,
  Check, X, ZoomIn, Share2, Maximize2, Home, Copy, Wrench, Bike, Users
} from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useFavoritesStore, useComparisonStore } from '@/stores/favorites-store'
import { useBrand } from '@/lib/brand-context'
import type { Product, ProductVariation, Review } from '@/types'
import { formatPrice, getDiscountPercent, proxyImageUrl } from '@/lib/storefront-utils'
import ProductCard from './product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog'

interface ProductDetailPageProps {
  slug: string
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { toggleComparison, isComparing } = useComparisonStore()
  const { theme } = useBrand()
  const { toast } = useToast()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({})
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [brandProducts, setBrandProducts] = useState<Product[]>([])
  const mainImageRef = useRef<HTMLDivElement>(null)

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
        // Load similar products from same category
        if (data.category?.slug) {
          try {
            const simRes = await fetch(`/api/products?category=${data.category.slug}&limit=9`)
            if (simRes.ok) {
              const simData = await simRes.json()
              const prods = (simData.products || simData || []).filter((p: any) => p.id !== data.id)
              setSimilarProducts(prods.slice(0, 8))
            }
          } catch { /* ignore */ }
        }
        // Load brand products
        if (data.brand?.slug) {
          try {
            const brandRes = await fetch(`/api/products?brand=${data.brand.slug}&limit=9`)
            if (brandRes.ok) {
              const brandData = await brandRes.json()
              const prods = (brandData.products || brandData || []).filter((p: any) => p.id !== data.id)
              setBrandProducts(prods.slice(0, 8))
            }
          } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [slug])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!fullscreenOpen) return
    function handleKey(e: KeyboardEvent) {
      const images = product?.images || []
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedImage(prev => Math.min(prev + 1, images.length - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedImage(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape') {
        setFullscreenOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreenOpen, product?.images])

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
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="w-20 h-20 mx-auto text-[var(--color-text-muted)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Ürün bulunamadı</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Aradığınız ürün kaldırılmış veya geçeri olarak mevcut olmayabilir.</p>
        <Button onClick={() => router.push('/')} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
          Ana Sayfaya Dön
        </Button>
      </div>
    )
  }

  const images = product.images || []
  const variations = product.variations || []
  const attributes = product.attributes || []
  const reviews = product.reviews || []
  const avgRating = product.avgRating || 0

  // Separate attributes into "specs" and "compatible models"
  const specAttributes = attributes.filter((a: any) =>
    !a.name?.toLowerCase().includes('model') &&
    !a.name?.toLowerCase().includes('uyum') &&
    !a.name?.toLowerCase().includes('uyumlu') &&
    !a.name?.toLowerCase().includes('compatible')
  )
  const modelAttributes = attributes.filter((a: any) =>
    a.name?.toLowerCase().includes('model') ||
    a.name?.toLowerCase().includes('uyum') ||
    a.name?.toLowerCase().includes('uyumlu') ||
    a.name?.toLowerCase().includes('compatible')
  )

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

  // Estimated shipping
  const shippingEstimate = product.shippingTime || (effectiveStock > 10 ? '1-2 iş günü' : effectiveStock > 0 ? '2-4 iş günü' : '')

  function handleImageZoom(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  function handlePrevImage() {
    setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1))
  }

  function handleNextImage() {
    setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0))
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
      toast({ title: 'Link kopyalandı', description: 'Ürün linki panoya kopyalandı' })
    }
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { name: theme.brandName, href: '/' },
    ...(product.category?.parent ? [{ name: product.category.parent.name, href: `/kategori/${product.category.parent.slug}` }] : []),
    ...(product.category ? [{ name: product.category.name, href: `/kategori/${product.category.slug}` }] : []),
    { name: product.name }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 animate-fade-in-up">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-6 overflow-x-auto pb-1" aria-label="Breadcrumb">
        {breadcrumbItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-border)]" />}
            {i === 0 && (
              <Home className="h-3.5 w-3.5 shrink-0" style={{ color: theme.colorPrimary }} />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-[var(--color-text)] font-medium truncate max-w-[200px] sm:max-w-none">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* ─── Product Main Section - 3 Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ═══ LEFT: Image Gallery (5 cols) ═══ */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main Image Container */}
          <div
            ref={mainImageRef}
            className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); }}
            onMouseMove={handleImageZoom}
          >
            {images[selectedImage] ? (
              <img
                src={proxyImageUrl(images[selectedImage].url)}
                alt={images[selectedImage].alt || product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out"
                style={isHovering ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: 'scale(1.8)',
                  cursor: 'zoom-in',
                } : {}}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: theme.colorSecondary }}>
                <Package className="h-16 w-16 mb-3" style={{ color: theme.colorPrimary }} />
                <p className="font-bold text-lg text-white">{theme.brandShortName}</p>
                <p className="text-sm text-white/60">Görsel Hazırlanıyor</p>
              </div>
            )}

            {/* Discount badge */}
            {effectiveHasDiscount && (
              <Badge
                className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1 border-0 rounded-lg"
                style={{ backgroundColor: theme.colorDanger }}
              >
                %{effectiveDiscountPercent} İndirim
              </Badge>
            )}

            {/* Image counter badge */}
            {images.length > 1 && (
              <Badge
                className="absolute top-4 right-4 text-white text-xs font-semibold px-2.5 py-1 border-0 rounded-lg"
                style={{ backgroundColor: theme.colorSecondary + 'CC' }}
              >
                {selectedImage + 1}/{images.length}
              </Badge>
            )}

            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreenOpen(true)}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: theme.colorText }}
              aria-label="Tam ekran görüntüle"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Zoom hint */}
            <div
              className="absolute bottom-3 left-3 rounded-lg px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: theme.colorTextSecondary }}
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Büyüt
            </div>

            {/* Carousel navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: theme.colorText }}
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: theme.colorText }}
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dot indicators for mobile */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                {images.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: i === selectedImage ? theme.colorPrimary : 'rgba(255,255,255,0.6)',
                      transform: i === selectedImage ? 'scale(1.3)' : 'scale(1)',
                    }}
                    aria-label={`Görsel ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id || i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 relative ${
                    i === selectedImage
                      ? 'shadow-md ring-2 ring-offset-1'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    borderColor: i === selectedImage ? theme.colorPrimary : theme.colorBorder,
                    ...(i === selectedImage ? { ringColor: theme.colorPrimaryLight } : {}),
                  }}
                  aria-label={`Görsel ${i + 1}`}
                >
                  <img
                    src={proxyImageUrl(img.url)}
                    alt={img.alt || ''}
                    className="w-full h-full object-cover"
                  />
                  {i === selectedImage && (
                    <div
                      className="absolute inset-0 border-2 rounded-xl pointer-events-none"
                      style={{ borderColor: theme.colorPrimary }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ MIDDLE: Product Info (4 cols) ═══ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Brand Name with Link */}
          {product.brand && (
            <Link
              href={`/marka/${product.brand.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide hover:underline transition-colors"
              style={{ color: theme.colorPrimary }}
            >
              {product.brand.logo && (
                <img src={proxyImageUrl(product.brand.logo)} alt={product.brand.name} className="h-5 w-5 object-contain rounded" />
              )}
              {product.brand.name}
            </Link>
          )}

          {/* Product Name */}
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold leading-tight" style={{ color: theme.colorText }}>
            {product.name}
          </h1>

          {/* SKU and OEM Code Badges */}
          {(product.sku || product.oemCode || product.productCode) && (
            <div className="flex flex-wrap items-center gap-2">
              {product.sku && (
                <Badge
                  variant="outline"
                  className="text-xs font-mono"
                  style={{ borderColor: theme.colorBorder, color: theme.colorTextSecondary }}
                >
                  SKU: {product.sku}
                </Badge>
              )}
              {product.oemCode && (
                <Badge
                  className="text-xs font-semibold border-0"
                  style={{ backgroundColor: theme.colorPrimaryLight, color: theme.colorPrimary }}
                >
                  OEM: {product.oemCode}
                </Badge>
              )}
              {product.productCode && (
                <Badge
                  variant="outline"
                  className="text-xs font-mono"
                  style={{ borderColor: theme.colorBorder, color: theme.colorTextSecondary }}
                >
                  Parça No: {product.productCode}
                </Badge>
              )}
            </div>
          )}

          {/* Rating Stars */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'fill-current' : ''}`}
                  style={{
                    color: star <= Math.round(avgRating) ? theme.colorPrimary : theme.colorBorder,
                  }}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: theme.colorTextSecondary }}>
              {avgRating > 0 ? avgRating.toFixed(1) : ''} ({reviews.length} değerlendirme)
            </span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm leading-relaxed" style={{ color: theme.colorTextSecondary }}>
              {product.shortDescription}
            </p>
          )}

          <Separator style={{ backgroundColor: theme.colorBorder }} />

          {/* Store info */}
          {product.store && (
            <div className="flex items-center gap-2">
              <Link
                href={`/magaza/${product.store.slug}`}
                className="text-sm flex items-center gap-1.5 transition-colors hover:underline"
                style={{ color: theme.colorTextSecondary }}
              >
                <Store className="h-4 w-4" style={{ color: theme.colorPrimary }} />
                {product.store.name}
              </Link>
              {product.store.rating > 0 && (
                <span className="text-sm flex items-center gap-0.5" style={{ color: theme.colorPrimary }}>
                  ★ {product.store.rating}
                </span>
              )}
            </div>
          )}

          {/* Variations */}
          {Object.entries(variationGroups).map(([name, options]) => (
            <div key={name}>
              <p className="text-sm font-semibold mb-2" style={{ color: theme.colorText }}>
                {name}: <span className="font-normal" style={{ color: theme.colorTextSecondary }}>{selectedVariations[name]}</span>
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
                      ? 'text-white border-0'
                      : 'hover:scale-105'
                    }
                    style={selectedVariations[name] === opt.value
                      ? { backgroundColor: theme.colorPrimary, borderColor: theme.colorPrimary }
                      : { borderColor: theme.colorBorder, color: theme.colorTextSecondary }
                    }
                  >
                    {opt.value}
                    {opt.stock <= 0 && ' (Tükendi)'}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Technical Specifications Preview (first 4) */}
          {specAttributes.length > 0 && (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: theme.colorBorder }}>
              <div className="px-4 py-2.5 font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: theme.colorSurface, color: theme.colorText }}>
                <Wrench className="h-4 w-4" style={{ color: theme.colorPrimary }} />
                Teknik Özellikler
              </div>
              <table className="w-full">
                <tbody>
                  {specAttributes.slice(0, 4).map((attr: any, i: number) => (
                    <tr key={attr.id || i} style={{ backgroundColor: i % 2 === 0 ? theme.colorSurface : theme.colorCard }}>
                      <td className="px-4 py-2.5 text-xs font-medium w-2/5" style={{ color: theme.colorText }}>{attr.name}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: theme.colorTextSecondary }}>{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {specAttributes.length > 4 && (
                <div className="px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      const el = document.querySelector('[data-value="specs"]') as HTMLElement
                      el?.click()
                    }}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: theme.colorPrimary }}
                  >
                    +{specAttributes.length - 4} özellik daha →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Compatible Models Preview */}
          {modelAttributes.length > 0 && (
            <div className="rounded-xl p-4 border" style={{ borderColor: theme.colorBorder, backgroundColor: theme.colorPrimaryLight + '30' }}>
              <div className="flex items-center gap-2 mb-2">
                <Bike className="h-4 w-4" style={{ color: theme.colorPrimary }} />
                <p className="text-sm font-semibold" style={{ color: theme.colorText }}>Uyumlu Modeller</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {modelAttributes.slice(0, 6).map((attr: any, i: number) => (
                  <Badge
                    key={attr.id || i}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: theme.colorPrimary + '40', color: theme.colorTextSecondary }}
                  >
                    {attr.value}
                  </Badge>
                ))}
                {modelAttributes.length > 6 && (
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer"
                    style={{ borderColor: theme.colorPrimary, color: theme.colorPrimary }}
                    onClick={() => {
                      const el = document.querySelector('[data-value="models"]') as HTMLElement
                      el?.click()
                    }}
                  >
                    +{modelAttributes.length - 6} model daha
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Compatibility info fallback */}
          {modelAttributes.length === 0 && specAttributes.length > 0 && (
            <div className="rounded-xl p-4" style={{ backgroundColor: theme.colorSurface }}>
              <p className="text-sm font-semibold mb-1" style={{ color: theme.colorText }}>Uyumluluk Bilgisi</p>
              <p className="text-xs" style={{ color: theme.colorTextMuted }}>Bu parçanın uyumlu olduğu modeller için teknik özellikler sekmesini inceleyin.</p>
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Sticky Price Box (3 cols) ═══ */}
        <div className="lg:col-span-3">
          <div className="sticky top-28 rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: theme.colorBorder }}>
            {/* Price Section */}
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                {effectiveHasDiscount && (
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-white border-0 text-sm px-2.5 py-0.5 font-bold"
                      style={{ backgroundColor: theme.colorDanger }}
                    >
                      %{effectiveDiscountPercent}
                    </Badge>
                    <span className="text-base line-through" style={{ color: theme.colorTextMuted }}>
                      {formatPrice(product.normalPrice)}
                    </span>
                  </div>
                )}
                <span className="text-3xl font-bold" style={{ color: theme.colorPrimary }}>
                  {formatPrice(currentPrice)}
                </span>
                {!effectiveHasDiscount && product.normalPrice > 0 && (
                  <p className="text-xs" style={{ color: theme.colorTextMuted }}>KDV Dahil</p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {effectiveStock > 0 ? (
                  <Badge
                    className="border-0 gap-1 font-medium"
                    style={{ backgroundColor: theme.colorSuccess + '18', color: theme.colorSuccess }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colorSuccess }} />
                    {effectiveStock > 10 ? 'Stokta' : `Son ${effectiveStock} adet`}
                  </Badge>
                ) : (
                  <Badge
                    className="border-0 gap-1 font-medium"
                    style={{ backgroundColor: theme.colorDanger + '18', color: theme.colorDanger }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colorDanger }} />
                    Stokta yok
                  </Badge>
                )}
              </div>

              {/* Shipping Info */}
              <div className="space-y-2 pt-1">
                {shippingEstimate && effectiveStock > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 shrink-0" style={{ color: theme.colorSuccess }} />
                    <span style={{ color: theme.colorTextSecondary }}>
                      Tahmini kargo: <strong style={{ color: theme.colorText }}>{shippingEstimate}</strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 shrink-0" style={{ color: theme.colorSuccess }} />
                  <span style={{ color: theme.colorTextSecondary }}>Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="h-4 w-4 shrink-0" style={{ color: theme.colorSuccess }} />
                  <span style={{ color: theme.colorTextSecondary }}>14 Gün İade Garantisi</span>
                </div>
              </div>
            </div>

            <Separator style={{ backgroundColor: theme.colorBorder }} />

            {/* Quantity + Action Buttons */}
            <div className="p-5 space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: theme.colorText }}>Adet:</span>
                <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: theme.colorBorder }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    style={{ color: theme.colorTextSecondary }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium text-sm" style={{ color: theme.colorText }}>{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    style={{ color: theme.colorTextSecondary }}
                    onClick={() => setQuantity(Math.min(effectiveStock || 99, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sepete Ekle - Primary CTA */}
              <Button
                onClick={handleAddToCart}
                disabled={effectiveStock <= 0}
                className="w-full h-12 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                style={{
                  backgroundColor: theme.colorPrimary,
                  boxShadow: `0 10px 15px -3px ${theme.colorPrimary}33`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colorPrimaryDark
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colorPrimary
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sepete Ekle
              </Button>

              {/* Favorilere Ekle - Outlined */}
              <Button
                variant="outline"
                className="w-full h-10 font-medium transition-all"
                style={{
                  borderColor: isFavorite(product.id) ? theme.colorDanger : theme.colorBorder,
                  color: isFavorite(product.id) ? theme.colorDanger : theme.colorTextSecondary,
                  backgroundColor: isFavorite(product.id) ? theme.colorDanger + '10' : 'transparent',
                }}
                onClick={() => {
                  toggleFavorite(product.id)
                  toast({
                    title: isFavorite(product.id) ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi',
                    description: product.name,
                  })
                }}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                Favorilere Ekle
              </Button>

              {/* WhatsApp ile Sor - Green */}
              {theme.brandDescription && (
                <Button
                  variant="outline"
                  className="w-full h-10 font-medium transition-all"
                  style={{
                    borderColor: '#25D366',
                    color: '#25D366',
                    backgroundColor: '#25D36608',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D36618'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D36608'
                  }}
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + window.location.href)}`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  WhatsApp ile Sor
                </Button>
              )}

              {/* Share + Compare Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  style={{ borderColor: theme.colorBorder, color: theme.colorTextSecondary }}
                  onClick={() => toggleComparison(product.id)}
                >
                  <BarChart3 className={`h-3.5 w-3.5 mr-1 ${isComparing(product.id) ? '' : ''}`} style={{ color: isComparing(product.id) ? theme.colorPrimary : undefined }} />
                  Karşılaştır
                </Button>
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  style={{ borderColor: theme.colorBorder, color: theme.colorTextSecondary }}
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  Paylaş
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Tabs Section ─── */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 overflow-x-auto" style={{ borderColor: theme.colorBorder }}>
          <TabsTrigger
            value="description"
            data-value="description"
            className="px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold whitespace-nowrap text-sm text-[var(--color-text-secondary)] data-[state=active]:text-[var(--color-text)]"
          >
            Ürün Açıklaması
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            data-value="specs"
            className="px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold whitespace-nowrap text-sm text-[var(--color-text-secondary)] data-[state=active]:text-[var(--color-text)]"
          >
            Teknik Özellikler
          </TabsTrigger>
          <TabsTrigger
            value="models"
            data-value="models"
            className="px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold whitespace-nowrap text-sm text-[var(--color-text-secondary)] data-[state=active]:text-[var(--color-text)]"
          >
            Uyumlu Modeller
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            data-value="reviews"
            className="px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold whitespace-nowrap text-sm text-[var(--color-text-secondary)] data-[state=active]:text-[var(--color-text)]"
          >
            Müşteri Yorumları ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Ürün Açıklaması */}
        <TabsContent value="description" className="pt-6">
          <div
            className="prose prose-sm max-w-none"
            style={{ color: theme.colorTextSecondary }}
            dangerouslySetInnerHTML={{ __html: product.description || '<p>Bu ürün için açıklama bulunmamaktadır.</p>' }}
          />
        </TabsContent>

        {/* Tab: Teknik Özellikler */}
        <TabsContent value="specs" className="pt-6">
          {specAttributes.length > 0 ? (
            <div className="border rounded-xl overflow-hidden max-w-2xl" style={{ borderColor: theme.colorBorder }}>
              <div className="px-5 py-3 font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: theme.colorSurface, color: theme.colorText }}>
                <Wrench className="h-4 w-4" style={{ color: theme.colorPrimary }} />
                {product.name} - Teknik Özellikler
              </div>
              <table className="w-full">
                <tbody>
                  {specAttributes.map((attr: any, i: number) => (
                    <tr key={attr.id || i} style={{ backgroundColor: i % 2 === 0 ? theme.colorSurface : theme.colorCard }}>
                      <td className="px-5 py-3 text-sm font-medium w-1/3" style={{ color: theme.colorText }}>{attr.name}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: theme.colorTextSecondary }}>{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colorBorder }} />
              <p style={{ color: theme.colorTextMuted }}>Bu ürün için teknik özellik bulunmamaktadır.</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Uyumlu Modeller */}
        <TabsContent value="models" className="pt-6">
          {modelAttributes.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border max-w-2xl" style={{ borderColor: theme.colorBorder }}>
                <div className="px-5 py-3 font-semibold text-sm flex items-center gap-2" style={{ backgroundColor: theme.colorPrimaryLight + '40', color: theme.colorText }}>
                  <Bike className="h-4 w-4" style={{ color: theme.colorPrimary }} />
                  Uyumlu Modeller ve Yıllar
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {modelAttributes.map((attr: any, i: number) => (
                      <Badge
                        key={attr.id || i}
                        variant="outline"
                        className="text-sm py-1 px-3"
                        style={{ borderColor: theme.colorPrimary + '40', color: theme.colorText, backgroundColor: theme.colorPrimaryLight + '20' }}
                      >
                        <Bike className="h-3 w-3 mr-1.5" style={{ color: theme.colorPrimary }} />
                        {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs max-w-2xl" style={{ color: theme.colorTextMuted }}>
                * Uyumluluk bilgileri üretici verilerine dayanmaktadır. Lütfen satın almadan önce aracınızın model yılı ve şasi numarasını kontrol ediniz.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bike className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colorBorder }} />
              <p style={{ color: theme.colorTextMuted }}>Bu ürün için uyumlu model bilgisi bulunmamaktadır.</p>
              <p className="text-xs mt-1" style={{ color: theme.colorTextMuted }}>
                Uyumluluk bilgisi için lütfen satıcıyla iletişime geçin.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Müşteri Yorumları */}
        <TabsContent value="reviews" className="pt-6">
          {reviews.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ borderColor: theme.colorBorder, backgroundColor: theme.colorSurface }}>
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: theme.colorText }}>{avgRating.toFixed(1)}</div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-current' : ''}`}
                        style={{ color: s <= Math.round(avgRating) ? theme.colorPrimary : theme.colorBorder }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: theme.colorTextMuted }}>{reviews.length} değerlendirme</p>
                </div>
                <Separator orientation="vertical" className="h-16" style={{ backgroundColor: theme.colorBorder }} />
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r: Review) => r.rating === star).length
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3" style={{ color: theme.colorTextSecondary }}>{star}</span>
                        <Star className="h-3 w-3 fill-current" style={{ color: theme.colorPrimary }} />
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colorBorder }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: theme.colorPrimary }}
                          />
                        </div>
                        <span className="w-8 text-right" style={{ color: theme.colorTextMuted }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review List */}
              {reviews.map((review: Review & { user?: { name: string } }) => (
                <div key={review.id} className="border rounded-xl p-5" style={{ borderColor: theme.colorBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: theme.colorPrimary }}
                      >
                        {(review.user?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm" style={{ color: theme.colorText }}>{review.user?.name || 'Anonim'}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-current' : ''}`}
                              style={{ color: s <= review.rating ? theme.colorPrimary : theme.colorBorder }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: theme.colorTextMuted }}>
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {review.title && <h4 className="font-medium text-sm mb-1" style={{ color: theme.colorText }}>{review.title}</h4>}
                  {review.comment && <p className="text-sm" style={{ color: theme.colorTextSecondary }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colorBorder }} />
              <p className="font-medium" style={{ color: theme.colorTextMuted }}>Bu ürün için henüz yorum yapılmamış.</p>
              <p className="text-xs mt-1" style={{ color: theme.colorTextMuted }}>İlk yorumu siz yapın ve diğer kullanıcılara yardımcı olun.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Benzer Ürünler ─── */}
      {similarProducts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.colorText }}>
              <Package className="h-5 w-5" style={{ color: theme.colorPrimary }} />
              Benzer Ürünler
            </h2>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {similarProducts.slice(0, 8).map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Aynı Markadan Ürünler ─── */}
      {brandProducts.length > 0 && product.brand && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.colorText }}>
              <Store className="h-5 w-5" style={{ color: theme.colorPrimary }} />
              Aynı Markadan Ürünler
            </h2>
            <Link
              href={`/marka/${product.brand.slug}`}
              className="text-sm font-semibold hover:underline flex items-center gap-1"
              style={{ color: theme.colorPrimary }}
            >
              Tümünü Gör
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {brandProducts.slice(0, 8).map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ Fullscreen Image Modal ═══ */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {product.name} - Görsel {selectedImage + 1}
          </DialogTitle>
          {/* Close button */}
          <button
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Kapat"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          )}

          {/* Main fullscreen image */}
          <div className="w-full h-[85vh] flex items-center justify-center relative">
            {images[selectedImage] ? (
              <img
                src={proxyImageUrl(images[selectedImage].url)}
                alt={images[selectedImage].alt || product.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/60">
                <Package className="h-20 w-20 mb-3" style={{ color: theme.colorPrimary }} />
                <p className="text-lg font-bold">{theme.brandShortName}</p>
                <p className="text-sm">Görsel Hazırlanıyor</p>
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip in fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-4 py-2">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id || i}
                  onClick={() => setSelectedImage(i)}
                  className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all"
                  style={{
                    borderColor: i === selectedImage ? theme.colorPrimary : 'rgba(255,255,255,0.3)',
                    opacity: i === selectedImage ? 1 : 0.6,
                  }}
                >
                  <img src={proxyImageUrl(img.url)} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
