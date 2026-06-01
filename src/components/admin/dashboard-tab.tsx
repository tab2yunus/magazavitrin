'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingCart, Users, Store, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DashboardData {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalStores: number
  totalRevenue: number
  recentOrders: any[]
  lowStockProducts: any[]
  ordersByStatus: Record<string, number>
}

const statusLabels: Record<string, string> = {
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

const chartColors = ['#F27A1A', '#0F1B2D', '#10B981', '#EF4444', '#9B59B6']

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return <div className="text-center py-10 text-gray-500">Veri yüklenemedi</div>

  const statCards = [
    { title: 'Toplam Ürün', value: data.totalProducts, icon: Package, color: 'text-[#F27A1A]', bg: 'bg-orange-50' },
    { title: 'Toplam Sipariş', value: data.totalOrders, icon: ShoppingCart, color: 'text-[#0F1B2D]', bg: 'bg-blue-50' },
    { title: 'Toplam Müşteri', value: data.totalCustomers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Toplam Mağaza', value: data.totalStores, icon: Store, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Toplam Ciro', value: `₺${data.totalRevenue.toLocaleString('tr-TR')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Düşük Stoklu Ürün', value: data.lowStockProducts?.length || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const chartData = Object.entries(data.ordersByStatus || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    değer: count,
  }))

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{card.title}</span>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Sipariş Durumları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="değer" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Sipariş No</TableHead>
                    <TableHead className="text-xs">Müşteri</TableHead>
                    <TableHead className="text-xs">Tutar</TableHead>
                    <TableHead className="text-xs">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs font-mono">{order.orderNumber}</TableCell>
                      <TableCell className="text-xs">{order.user?.name || '-'}</TableCell>
                      <TableCell className="text-xs font-semibold">₺{order.totalAmount?.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Düşük Stoklu Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Ürün Adı</TableHead>
                    <TableHead className="text-xs">Mağaza</TableHead>
                    <TableHead className="text-xs">Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStockProducts?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-xs font-medium max-w-[150px] truncate">{product.name}</TableCell>
                      <TableCell className="text-xs">{product.store?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-[10px]">
                          {product.stock} adet
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
