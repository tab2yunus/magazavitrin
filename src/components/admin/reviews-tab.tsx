'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReviewItem {
  id: string
  userId: string
  productId: string
  rating: number
  title?: string
  comment?: string
  isActive: boolean
  createdAt: string
  user?: { name: string }
  product?: { name: string }
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => { if (!cancelled) { setReviews(Array.isArray(d) ? d : []); setLoading(false) } })
      .catch(() => { if (!cancelled) { toast.error('Yorumlar yüklenemedi'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const fetchReviews = useCallback(() => {
    setLoading(true)
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Yorumlar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (review: ReviewItem) => {
    try {
      await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !review.isActive }),
      })
      toast.success(review.isActive ? 'Yorum gizlendi' : 'Yorum yayınlandı')
      fetchReviews()
    } catch { toast.error('Güncelleme başarısız') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      toast.success('Yorum silindi')
      fetchReviews()
    } catch { toast.error('Silme başarısız') }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="space-y-4"><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Yorumlar</h3>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Yorum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[150px] truncate">{r.product?.name || '-'}</TableCell>
                    <TableCell className="text-sm">{r.user?.name || '-'}</TableCell>
                    <TableCell>{renderStars(r.rating)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                      {r.title && <span className="font-medium">{r.title}: </span>}
                      {r.comment || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Badge className={r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {r.isActive ? 'Yayında' : 'Gizli'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(r)} title={r.isActive ? 'Gizle' : 'Yayınla'}>
                          {r.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reviews.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Yorum bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
