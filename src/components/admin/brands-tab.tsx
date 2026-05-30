'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import { toast } from 'sonner'

interface BrandItem {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  _count?: { products: number }
}

const defaultForm = {
  name: '', slug: '', description: '', isActive: true, seoTitle: '', seoDescription: '',
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BrandItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchBrands = useCallback(() => {
    setLoading(true)
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Markalar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchBrands() }, [fetchBrands])

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }
  const openEdit = (b: BrandItem) => {
    setEditing(b)
    setForm({
      name: b.name, slug: b.slug, description: b.description || '',
      isActive: b.isActive, seoTitle: b.seoTitle || '', seoDescription: b.seoDescription || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Marka adı zorunludur'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
      const body = { ...form, slug }
      if (editing) {
        await fetch(`/api/brands/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Marka güncellendi')
      } else {
        await fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Marka oluşturuldu')
      }
      setDialogOpen(false)
      fetchBrands()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' })
      toast.success('Marka silindi')
      fetchBrands()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Markalar</h3>
        <Button onClick={openNew} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Marka
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
                  <TableHead>Slug</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Ürün Sayısı</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {b.logo ? <img src={b.logo} alt={b.name} className="w-8 h-8 rounded object-cover" /> : <Award className="w-4 h-4 text-gray-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">{b.slug}</TableCell>
                    <TableCell>
                      <Badge className={b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {b.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{b._count?.products || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {brands.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Marka bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Marka Düzenle' : 'Yeni Marka'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Marka Adı *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Açıklama</Label><textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>{form.isActive ? 'Aktif' : 'Pasif'}</Label></div>
            <div className="space-y-2"><Label>SEO Başlık</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} /></div>
            <div className="space-y-2"><Label>SEO Açıklama</Label><Input value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#F27A1A] hover:bg-[#e06d10]">{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
