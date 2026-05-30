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
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface BannerItem {
  id: string
  title: string
  image: string
  link?: string
  position: string
  sortOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

const positionLabels: Record<string, string> = {
  home_slider: 'Ana Sayfa Slider',
  home_sidebar: 'Ana Sayfa Yan Alan',
  category_top: 'Kategori Üstü',
}

const defaultForm = {
  title: '', image: '', link: '', position: 'home_slider',
  sortOrder: '0', isActive: true, startDate: '', endDate: '',
}

export default function BannersTab() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BannerItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchBanners = useCallback(() => {
    setLoading(true)
    fetch('/api/banners?active=')
      .then(r => r.json())
      .then(d => setBanners(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Bannerlar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }
  const openEdit = (b: BannerItem) => {
    setEditing(b)
    setForm({
      title: b.title, image: b.image, link: b.link || '',
      position: b.position, sortOrder: String(b.sortOrder), isActive: b.isActive,
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) { toast.error('Başlık ve görsel zorunludur'); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        sortOrder: parseInt(form.sortOrder) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        link: form.link || null,
      }
      if (editing) {
        await fetch(`/api/banners/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Banner güncellendi')
      } else {
        await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Banner oluşturuldu')
      }
      setDialogOpen(false)
      fetchBanners()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bannerı silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      toast.success('Banner silindi')
      fetchBanners()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bannerlar</h3>
        <Button onClick={openNew} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="w-20 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                        {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{positionLabels[b.position] || b.position}</Badge></TableCell>
                    <TableCell className="text-sm">{b.sortOrder}</TableCell>
                    <TableCell>
                      <Badge className={b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {b.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Banner bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Banner Düzenle' : 'Yeni Banner'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2 space-y-2"><Label>Başlık *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Görsel URL *</Label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Link</Label><Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Pozisyon</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="home_slider">Ana Sayfa Slider</option>
                <option value="home_sidebar">Ana Sayfa Yan Alan</option>
                <option value="category_top">Kategori Üstü</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} /></div>
            <div className="flex items-center gap-3 pt-6"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>{form.isActive ? 'Aktif' : 'Pasif'}</Label></div>
            <div className="space-y-2"><Label>Başlangıç Tarihi</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Bitiş Tarihi</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
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
