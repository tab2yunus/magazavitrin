'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface CustomerItem {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
  _count: { orders: number }
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(d => setCustomers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4"><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Müşteriler</h3>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Sipariş Sayısı</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{c.email}</TableCell>
                    <TableCell className="text-sm">{c.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c._count.orders}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Badge className={c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {c.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Müşteri bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
