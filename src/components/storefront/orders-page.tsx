'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Package, ChevronRight } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice, getStatusColor, getStatusText } from '@/lib/storefront-utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersPage() {
  const router = useRouter()
  const { user, fetchUser, isLoading } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
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
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    if (user) loadOrders()
  }, [user])

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#1A2744] mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A2744] mb-2">Henüz siparişiniz yok</h2>
          <p className="text-gray-500 mb-6">Hemen alışverişe başlayın!</p>
          <Button onClick={() => router.push('/')} className="bg-[#F27A1A] hover:bg-[#D4630E]">
            Alışverişe Başla
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/siparislerim/${order.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#FFF3E8] flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-[#F27A1A]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1A2744]">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right">
                        <Badge className={`${getStatusColor(order.status)} border-0 text-xs`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-sm font-bold text-[#1A2744] mt-1">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Mobile info */}
                  <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t">
                    <Badge className={`${getStatusColor(order.status)} border-0 text-xs`}>
                      {getStatusText(order.status)}
                    </Badge>
                    <p className="text-sm font-bold text-[#1A2744]">{formatPrice(order.totalAmount)}</p>
                  </div>

                  {order.items && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={item.id} className="w-8 h-8 rounded-md bg-gray-100 border-2 border-white overflow-hidden">
                            {item.product?.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">📦</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {order.items.length} ürün
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
