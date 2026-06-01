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

interface CouponItem {
  id: string
  code: string
  type: string
  value: number
  minAmount: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startDate?: string
  endDate?: string
  isActive: boolean
}

const defaultForm = {
  code: '', type: 'percentage', value: '', minAmount: '0', maxDiscount: '',
  usageLimit: '', startDate: '', endDate: '', isActive: true,
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CouponItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchCoupons = useCallback(() => {
    setLoading(true)
    fetch('/api/coupons')
      .then(r => r.json())
      .then(d => setCoupons(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Kuponlar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }
  const openEdit = (c: CouponItem) => {
    setEditing(c)
    setForm({
      code: c.code, type: c.type, value: String(c.value), minAmount: String(c.minAmount),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      isActive: c.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('Kupon kodu zorunludur'); return }
    setSaving(true)
    try {
      const body = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value) || 0,
        minAmount: parseFloat(form.minAmount) || 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      }
      if (editing) {
        await fetch(`/api/coupons/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kupon güncellendi')
      } else {
        await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kupon oluşturuldu')
      }
      setDialogOpen(false)
      fetchCoupons()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      toast.success('Kupon silindi')
      fetchCoupons()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kuponlar</h3>
        <Button onClick={openNew} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Kupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Değer</TableHead>
                  <TableHead>Min Tutar</TableHead>
                  <TableHead>Kullanım</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold text-[var(--color-primary)]">{c.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.type === 'percentage' ? 'Yüzde (%)' : 'Sabit (₺)'}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {c.type === 'percentage' ? `%${c.value}` : `₺${c.value}`}
                    </TableCell>
                    <TableCell className="text-sm">₺{c.minAmount}</TableCell>
                    <TableCell className="text-sm">
                      {c.usedCount} / {c.usageLimit || '∞'}
                    </TableCell>
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
                {coupons.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Kupon bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kupon Düzenle' : 'Yeni Kupon'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Kupon Kodu *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="HOSGELDIN" /></div>
            <div className="space-y-2">
              <Label>Tip</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Yüzde (%)</option>
                <option value="fixed">Sabit Tutar (₺)</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Değer *</Label><Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Min Tutar</Label><Input type="number" step="0.01" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Maks İndirim</Label><Input type="number" step="0.01" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="Sınırsız" /></div>
            <div className="space-y-2"><Label>Kullanım Limiti</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Sınırsız" /></div>
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
