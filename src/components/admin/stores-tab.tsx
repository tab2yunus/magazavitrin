'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Store } from 'lucide-react'
import { toast } from 'sonner'

interface StoreItem {
  id: string
  name: string
  slug: string
  logo?: string
  city?: string
  category?: string
  rating: number
  followerCount: number
  salesCount: number
  isActive: boolean
  description?: string
  seoTitle?: string
  seoDescription?: string
  _count?: { products: number }
}

const defaultForm = {
  name: '', slug: '', city: '', category: '', rating: 0,
  followerCount: 0, salesCount: 0, isActive: true,
  description: '', seoTitle: '', seoDescription: '',
}

export default function StoresTab() {
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<StoreItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchStores = useCallback(() => {
    setLoading(true)
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => setStores(d))
      .catch(() => toast.error('Mağazalar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchStores() }, [fetchStores])

  const openNew = () => {
    setEditing(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (store: StoreItem) => {
    setEditing(store)
    setForm({
      name: store.name, slug: store.slug, city: store.city || '', category: store.category || '',
      rating: store.rating, followerCount: store.followerCount, salesCount: store.salesCount,
      isActive: store.isActive, description: store.description || '',
      seoTitle: store.seoTitle || '', seoDescription: store.seoDescription || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Mağaza adı zorunludur'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, '')
      const body = { ...form, slug }
      if (editing) {
        await fetch(`/api/stores/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Mağaza güncellendi')
      } else {
        await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Mağaza oluşturuldu')
      }
      setDialogOpen(false)
      fetchStores()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mağazayı silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/stores/${id}`, { method: 'DELETE' })
      toast.success('Mağaza silindi')
      fetchStores()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mağazalar</h3>
        <Button onClick={openNew} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Mağaza
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Takipçi</TableHead>
                  <TableHead>Satış</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-[#0F1B2D] flex items-center justify-center">
                        {s.logo ? <img src={s.logo} alt={s.name} className="w-8 h-8 rounded object-cover" /> : <Store className="w-4 h-4 text-white" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{s.city || '-'}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{s.category || '-'}</Badge></TableCell>
                    <TableCell className="text-sm">⭐ {s.rating}</TableCell>
                    <TableCell className="text-sm">{s.followerCount.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-sm">{s.salesCount.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>
                      <Badge className={s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {s.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {stores.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">Mağaza bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Mağaza Düzenle' : 'Yeni Mağaza'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Mağaza Adı *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mağaza adı" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="magaza-adi" />
            </div>
            <div className="space-y-2">
              <Label>Şehir</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="İstanbul" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Elektronik" />
            </div>
            <div className="space-y-2">
              <Label>Puan</Label>
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Takipçi Sayısı</Label>
              <Input type="number" value={form.followerCount} onChange={e => setForm(f => ({ ...f, followerCount: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Satış Sayısı</Label>
              <Input type="number" value={form.salesCount} onChange={e => setForm(f => ({ ...f, salesCount: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>{form.isActive ? 'Aktif' : 'Pasif'}</Label>
            </div>
            <div className="col-span-full space-y-2">
              <Label>Açıklama</Label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>SEO Başlık</Label>
              <Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>SEO Açıklama</Label>
              <Input value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#F27A1A] hover:bg-[#e06d10]">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
