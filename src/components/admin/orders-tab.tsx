'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  orderNumber: string
  userId: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  trackingNumber?: string
  notes?: string
  shippingAddress?: string
  createdAt: string
  user?: { name: string; email: string; phone?: string }
  items?: any[]
  coupon?: any
}

const statusLabels: Record<string, string> = {
  all: 'Tümü',
  pending: 'Beklemede',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentLabels: Record<string, string> = {
  cod: 'Kapıda Ödeme',
  bank_transfer: 'Havale/EFT',
  demo_payment: 'Demo Ödeme',
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    fetch(`/api/admin/orders${params}`)
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders || [])
        if (d.statusCounts) setStatusCounts(d.statusCounts)
      })
      .catch(() => toast.error('Siparişler yüklenemedi'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const openDetail = (order: OrderItem) => {
    setDetailOrder(order)
    setNewStatus(order.status)
    setTrackingNumber(order.trackingNumber || '')
    setDetailOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!detailOrder) return
    setSaving(true)
    try {
      await fetch(`/api/orders/${detailOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, trackingNumber: trackingNumber || null }),
      })
      toast.success('Sipariş durumu güncellendi')
      setDetailOpen(false)
      fetchOrders()
    } catch { toast.error('Güncelleme başarısız') }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Siparişler</h3>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex-wrap h-auto gap-1 bg-white p-1 rounded-lg border">
          <TabsTrigger value="all" className="text-xs">Tümü ({totalOrders})</TabsTrigger>
          {Object.entries(statusLabels).filter(([k]) => k !== 'all').map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {label} ({statusCounts[key] || 0})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Ödeme</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                    <TableCell className="text-sm">
                      <div>{o.user?.name || '-'}</div>
                      <div className="text-xs text-gray-400">{o.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">₺{o.totalAmount?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[10px] w-fit">{paymentLabels[o.paymentMethod] || o.paymentMethod}</Badge>
                        <Badge className={o.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 text-[10px]' : 'bg-yellow-100 text-yellow-800 text-[10px]'}>
                          {o.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[o.status] || 'bg-gray-100 text-gray-800'}>
                        {statusLabels[o.status] || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openDetail(o)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Sipariş bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı - {detailOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Müşteri:</span> <span className="font-medium">{detailOrder.user?.name}</span></div>
                <div><span className="text-gray-500">E-posta:</span> <span className="font-medium">{detailOrder.user?.email}</span></div>
                <div><span className="text-gray-500">Telefon:</span> <span className="font-medium">{detailOrder.user?.phone || '-'}</span></div>
                <div><span className="text-gray-500">Tarih:</span> <span className="font-medium">{new Date(detailOrder.createdAt).toLocaleString('tr-TR')}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Adres:</span> <span className="font-medium">{detailOrder.shippingAddress || '-'}</span></div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ürün</TableHead>
                      <TableHead className="text-xs">Miktar</TableHead>
                      <TableHead className="text-xs">Birim Fiyat</TableHead>
                      <TableHead className="text-xs">Toplam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailOrder.items?.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{item.productName}</TableCell>
                        <TableCell className="text-xs">{item.quantity}</TableCell>
                        <TableCell className="text-xs">₺{item.unitPrice?.toLocaleString('tr-TR')}</TableCell>
                        <TableCell className="text-xs font-semibold">₺{item.totalPrice?.toLocaleString('tr-TR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center text-sm border-t pt-3">
                <div className="space-y-1">
                  <div>Ara Toplam: ₺{detailOrder.subtotal?.toLocaleString('tr-TR')}</div>
                  <div>Kargo: ₺{detailOrder.shippingCost?.toLocaleString('tr-TR')}</div>
                  {detailOrder.discountAmount > 0 && <div>İndirim: -₺{detailOrder.discountAmount?.toLocaleString('tr-TR')}</div>}
                </div>
                <div className="text-lg font-bold">₺{detailOrder.totalAmount?.toLocaleString('tr-TR')}</div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-sm">Sipariş Durumunu Güncelle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durum</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).filter(([k]) => k !== 'all').map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Takip Numarası</Label>
                    <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Kargo takip no" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button>
            <Button onClick={handleUpdateStatus} disabled={saving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
              {saving ? 'Kaydediliyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
