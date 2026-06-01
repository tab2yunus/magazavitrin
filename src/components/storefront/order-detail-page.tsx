'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, MapPin, CreditCard, Truck, ChevronRight, ArrowLeft } from 'lucide-react'
import { useBrand } from '@/lib/brand-context'
import type { Order } from '@/types'
import { formatPrice, getStatusColor, getStatusText, getPaymentMethodText } from '@/lib/storefront-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderDetailPageProps {
  id: string
}

export default function OrderDetailPage({ id }: OrderDetailPageProps) {
  const router = useRouter()
  const { theme } = useBrand()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const loadOrder = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Sipariş bulunamadı</h2>
        <Button onClick={() => router.push('/siparislerim')} className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
          Siparişlerime Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/siparislerim')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Sipariş #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Order status */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Package className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Sipariş Durumu</p>
                  <Badge className={`${getStatusColor(order.status)} border-0 mt-1`}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Takip No</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Truck className="h-4 w-4 text-[var(--color-success)]" /> {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sipariş Ürünleri ({order.items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.quantity} adet</p>
                </div>
                <p className="text-sm font-semibold shrink-0">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[var(--color-primary)]" /> Teslimat Adresi
              </h3>
              <p className="text-sm text-gray-600">{order.shippingAddress || 'Belirtilmemiş'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-[var(--color-primary)]" /> Ödeme
              </h3>
              <p className="text-sm text-gray-600">{getPaymentMethodText(order.paymentMethod)}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {order.paymentStatus === 'paid' ? 'Ödendi' : order.paymentStatus === 'pending' ? 'Beklemede' : order.paymentStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ara Toplam</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kargo</span>
                <span>{order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span className="text-[var(--color-primary)]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
