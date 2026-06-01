'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Package } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useFavoritesStore } from '@/stores/favorites-store'
import type { Product } from '@/types'
import { formatPrice, getDiscountPercent, proxyImageUrl } from '@/lib/storefront-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: Product & { avgRating?: number; reviewCount?: number }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.normalPrice
  const discountPercent = hasDiscount ? getDiscountPercent(product.normalPrice, product.discountPrice!) : 0
  const currentPrice = product.discountPrice || product.normalPrice
  const imageUrl = proxyImageUrl(product.images?.[0]?.url || '')
  const rating = (product as Product & { avgRating?: number; reviewCount?: number }).avgRating || 0
  const reviewCount = (product as Product & { avgRating?: number; reviewCount?: number }).reviewCount || 0
  const inStock = product.stock > 0
  const hasOemCode = !!product.sku

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      await addItem(product.id, 1)
      toast({ title: 'Sepete eklendi', description: product.name })
    } catch {
      toast({ title: 'Hata', description: 'Sepete eklenemedi', variant: 'destructive' })
    }
  }, [addItem, product.id, product.name, toast])

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    await toggleFavorite(product.id)
  }, [toggleFavorite, product.id])

  return (
    <Link
      href={`/urun/${product.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border overflow-hidden cursor-pointer relative"
      style={{
        borderColor: '#E2E5EA',
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 12px 24px -6px rgba(242, 122, 26, 0.15), 0 4px 8px -2px rgba(15, 27, 45, 0.08)'
          : '0 1px 3px 0 rgba(15, 27, 45, 0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Area ── */}
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#F4F5F7' }}>
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* ── Branded Placeholder ── */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2 select-none"
            style={{ backgroundColor: '#0F1B2D' }}
          >
            <Package className="h-8 w-8 mb-1" style={{ color: '#F27A1A' }} />
            <span className="text-sm font-bold tracking-wider" style={{ color: '#F27A1A' }}>
              İKİZ MOTOR
            </span>
            <span className="text-[10px] font-medium tracking-wide" style={{ color: '#8C95A6' }}>
              ORİJİNAL YEDEK PARÇA
            </span>
            <span className="text-[9px] mt-auto mb-3 tracking-wide" style={{ color: '#4A5568' }}>
              GÖRSEL HAZIRLANIYOR
            </span>
          </div>
        )}

        {/* ── Discount Badge ── */}
        {hasDiscount && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center justify-center px-2 py-0.5 rounded-md text-white text-xs font-bold z-10"
            style={{ backgroundColor: '#EF4444' }}
          >
            %{discountPercent}
          </div>
        )}

        {/* ── OEM / ORİJİNAL Badge ── */}
        {hasOemCode && (
          <div
            className="absolute top-2.5 flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide z-10"
            style={{
              backgroundColor: hasDiscount ? 'rgba(15, 185, 129, 0.9)' : 'rgba(15, 185, 129, 0.9)',
              color: '#ffffff',
              left: hasDiscount ? '3.5rem' : '0.625rem',
            }}
          >
            OEM
          </div>
        )}

        {/* ── Favorite Button (Glass Morphism) ── */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-200 hover:scale-110"
          style={{
            background: isFavorite(product.id)
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(15, 27, 45, 0.08)',
            border: isFavorite(product.id)
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.4)',
          }}
          aria-label={isFavorite(product.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            className="h-4 w-4 transition-all duration-200"
            style={{
              fill: isFavorite(product.id) ? '#EF4444' : 'none',
              color: isFavorite(product.id) ? '#EF4444' : '#4A5568',
            }}
          />
        </button>

        {/* ── Sepete Ekle Slide-Up Button ── */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out',
          }}
        >
          <Button
            onClick={handleAddToCart}
            className="w-full text-white font-semibold h-10 text-sm rounded-lg border-0 shadow-lg"
            style={{
              backgroundColor: '#F27A1A',
              boxShadow: '0 4px 14px rgba(242, 122, 26, 0.35)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D4630E'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F27A1A'
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Sepete Ekle
          </Button>
        </div>
      </div>

      {/* ── Info Area ── */}
      <div className="p-4">
        {/* Brand Name */}
        {product.brand && (
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-1 truncate"
            style={{ color: '#8C95A6' }}
          >
            {product.brand.name}
          </p>
        )}

        {/* Product Name */}
        <h3
          className="text-sm font-medium leading-5 line-clamp-2 mb-1.5"
          style={{
            color: '#0F1B2D',
            minHeight: '2.5rem',
          }}
        >
          {product.name}
        </h3>

        {/* Rating Stars */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3.5 w-3.5"
                  style={{
                    fill: star <= Math.round(rating) ? '#F27A1A' : 'transparent',
                    color: star <= Math.round(rating) ? '#F27A1A' : '#E2E5EA',
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: '#8C95A6' }}>
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex flex-col mb-2">
          {hasDiscount && (
            <span
              className="text-xs line-through mb-0.5"
              style={{ color: '#8C95A6' }}
            >
              {formatPrice(product.normalPrice)}
            </span>
          )}
          <span
            className="text-lg font-bold leading-tight"
            style={{ color: hasDiscount ? '#F27A1A' : '#0F1B2D' }}
          >
            {formatPrice(currentPrice)}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="mb-2">
          {inStock ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: '#10B981' }}
              />
              Stokta
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: '#EF4444' }}
              />
              Tükendi
            </span>
          )}
        </div>

        {/* Store Name */}
        {product.store && (
          <Link
            href={`/magaza/${product.store.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] truncate block transition-colors duration-200 hover:underline"
            style={{ color: '#8C95A6' }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#F27A1A'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#8C95A6'
            }}
          >
            {product.store.name}
          </Link>
        )}
      </div>
    </Link>
  )
}
