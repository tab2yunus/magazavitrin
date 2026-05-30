'use client'

import { useState, useEffect } from 'react'
import { Trash2, Minus, Plus, ShoppingCart, Tag, ArrowRight } from 'lucide-react'
import { useRouterStore } from '@/stores/router-store'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/storefront-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function CartPage() {
  const { navigate } = useRouterStore()
  const { items, fetchCart, updateItem, removeItem, applyCoupon, getSubtotal, getShippingCost, getTotal, couponCode, couponDiscount } = useCartStore()
  const { toast } = useToast()
  const [couponInput, setCouponInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      await fetchCart()
      setLoading(false)
    }
    load()
  }, [fetchCart])

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    await updateItem(itemId, quantity)
  }

  async function handleRemoveItem(itemId: string) {
    await removeItem(itemId)
    toast({ title: 'Ürün sepetten kaldırıldı' })
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    const success = await applyCoupon(couponInput.trim())
    if (success) {
      toast({ title: 'Kupon kodu uygulandı' })
    } else {
      toast({ title: 'Geçersiz kupon', description: 'Kupon kodu geçerli değil veya süresi dolmuş', variant: 'destructive' })
    }
  }

  const subtotal = getSubtotal()
  const shipping = getShippingCost()
  const total = getTotal()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1A2744] mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-6">Hemen alışverişe başlayın!</p>
        <Button onClick={() => navigate({ page: 'home' })} className="bg-[#F27A1A] hover:bg-[#D4630E]">
          Alışverişe Başla
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#1A2744] mb-6">Sepetim ({items.length} ürün)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            const price = product.discountPrice || product.normalPrice
            const imageUrl = product.images?.[0]?.url || `https://placehold.co/100x100/F5F5F5/999?text=Ürün`

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <button
                      onClick={() => navigate({ page: 'product', slug: product.slug })}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-[#F5F5F5]"
                    >
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate({ page: 'product', slug: product.slug })}
                        className="text-sm font-medium text-[#1A2744] hover:text-[#F27A1A] line-clamp-2 text-left"
                      >
                        {product.name}
                      </button>
                      {product.brand && (
                        <p className="text-xs text-gray-500 mt-0.5">{product.brand.name}</p>
                      )}
                      {product.store && (
                        <button
                          onClick={() => navigate({ page: 'store', slug: product.store!.slug })}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {product.store.name}
                        </button>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {product.discountPrice && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(product.normalPrice)}</p>
                            )}
                            <p className="font-bold text-[#F27A1A]">{formatPrice(price * item.quantity)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-[#E74C3C]"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon */}
              <div className="flex gap-2">
                <Input
                  placeholder="Kupon kodu"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-9"
                />
                <Button
                  onClick={handleApplyCoupon}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Tag className="h-4 w-4 mr-1" /> Uygula
                </Button>
              </div>

              {couponCode && (
                <div className="bg-green-50 text-green-700 text-xs p-2 rounded flex items-center justify-between">
                  <span>Kupon: {couponCode}</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ara Toplam</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kargo</span>
                  <span className="font-medium">{shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span className="text-[#F27A1A]">{formatPrice(total)}</span>
              </div>

              {shipping === 0 && (
                <p className="text-xs text-[#3CB371] text-center">🎉 Ücretsiz kargo!</p>
              )}
              {shipping > 0 && subtotal < 200 && (
                <p className="text-xs text-gray-400 text-center">
                  {formatPrice(200 - subtotal)} daha ekleyin, kargo bedava!
                </p>
              )}

              <Button
                onClick={() => navigate({ page: 'checkout' })}
                className="w-full h-12 text-base font-bold bg-[#F27A1A] hover:bg-[#D4630E]"
              >
                Sipariş Ver <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
