'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useRouterStore } from '@/stores/router-store'
import { useCartStore } from '@/stores/cart-store'
import { useFavoritesStore } from '@/stores/favorites-store'
import type { Product } from '@/types'
import { formatPrice, getDiscountPercent } from '@/lib/storefront-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: Product & { avgRating?: number; reviewCount?: number }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigate } = useRouterStore()
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const hasDiscount = product.discountPrice && product.discountPrice < product.normalPrice
  const discountPercent = hasDiscount ? getDiscountPercent(product.normalPrice, product.discountPrice!) : 0
  const currentPrice = product.discountPrice || product.normalPrice
  const imageUrl = product.images?.[0]?.url || `https://placehold.co/300x300/F5F5F5/999?text=${encodeURIComponent(product.name.slice(0, 12))}`
  const rating = (product as any).avgRating || 0
  const reviewCount = (product as any).reviewCount || 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await addItem(product.id, 1)
      toast({ title: 'Sepete eklendi', description: product.name })
    } catch {
      toast({ title: 'Hata', description: 'Sepete eklenemedi', variant: 'destructive' })
    }
  }

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    await toggleFavorite(product.id)
  }

  return (
    <div
      className="product-card group bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate({ page: 'product', slug: product.slug })}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-10 w-10" />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-[#E74C3C] text-white text-xs font-bold px-2 py-0.5 border-0">
            %{discountPercent}
          </Badge>
        )}

        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-[#E74C3C] text-[#E74C3C]' : 'text-gray-400'}`}
          />
        </button>

        {/* Add to cart button - shows on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-200 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <Button
            onClick={handleAddToCart}
            className="w-full bg-[#F27A1A] hover:bg-[#D4630E] text-white font-semibold h-9 text-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Sepete Ekle
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-0.5 truncate">{product.brand.name}</p>
        )}

        {/* Name */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] leading-5 mb-1">
          {product.name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(rating) ? 'fill-[#F27A1A] text-[#F27A1A]' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex flex-col">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.normalPrice)}
            </span>
          )}
          <span className={`text-lg font-bold ${hasDiscount ? 'text-[#F27A1A]' : 'text-[#1A2744]'}`}>
            {formatPrice(currentPrice)}
          </span>
        </div>

        {/* Store */}
        {product.store && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate({ page: 'store', slug: product.store!.slug })
            }}
            className="text-xs text-gray-500 hover:text-[#F27A1A] mt-1 truncate block transition-colors"
          >
            {product.store.name}
          </button>
        )}
      </div>
    </div>
  )
}
