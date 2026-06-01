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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CampaignItem {
  id: string
  title: string
  slug: string
  description?: string
  image?: string
  discountText?: string
  link?: string
  startDate?: string
  endDate?: string
  isActive: boolean
  sortOrder: number
}

const defaultForm = {
  title: '', slug: '', description: '', image: '', discountText: '',
  link: '', startDate: '', endDate: '', isActive: true, sortOrder: '0',
}

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CampaignItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchCampaigns = useCallback(() => {
    setLoading(true)
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => setCampaigns(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Kampanyalar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }
  const openEdit = (c: CampaignItem) => {
    setEditing(c)
    setForm({
      title: c.title, slug: c.slug, description: c.description || '', image: c.image || '',
      discountText: c.discountText || '', link: c.link || '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      isActive: c.isActive, sortOrder: String(c.sortOrder),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Kampanya başlığı zorunludur'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, '')
      const body = {
        ...form, slug, sortOrder: parseInt(form.sortOrder) || 0,
        startDate: form.startDate || null, endDate: form.endDate || null,
        description: form.description || null, image: form.image || null,
        discountText: form.discountText || null, link: form.link || null,
      }
      if (editing) {
        await fetch(`/api/campaigns/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kampanya güncellendi')
      } else {
        await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kampanya oluşturuldu')
      }
      setDialogOpen(false)
      fetchCampaigns()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      toast.success('Kampanya silindi')
      fetchCampaigns()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kampanyalar</h3>
        <Button onClick={openNew} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Kampanya
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>İndirim Metni</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>
                      {c.discountText ? <Badge className="bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{c.discountText}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[150px] truncate">{c.link || '-'}</TableCell>
                    <TableCell className="text-sm">{c.sortOrder}</TableCell>
                    <TableCell>
                      <Badge className={c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {c.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Kampanya bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kampanya Düzenle' : 'Yeni Kampanya'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Başlık *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2"><Label>İndirim Metni</Label><Input value={form.discountText} onChange={e => setForm(f => ({ ...f, discountText: e.target.value }))} placeholder="%30'a varan indirim" /></div>
            <div className="space-y-2"><Label>Link</Label><Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Açıklama</Label><textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Görsel URL</Label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Başlangıç</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Bitiş</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>{form.isActive ? 'Aktif' : 'Pasif'}</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
