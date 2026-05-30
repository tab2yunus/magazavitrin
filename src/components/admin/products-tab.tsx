'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'

interface ProductItem {
  id: string
  name: string
  slug: string
  sku?: string
  barcode?: string
  description?: string
  shortDescription?: string
  normalPrice: number
  discountPrice?: number
  stock: number
  shippingTime?: string
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  isNew: boolean
  brandId?: string
  categoryId?: string
  storeId?: string
  seoTitle?: string
  seoDescription?: string
  brand?: { id: string; name: string }
  category?: { id: string; name: string }
  store?: { id: string; name: string }
  images?: { url: string; alt?: string }[]
}

interface OptionItem { id: string; name: string; slug: string }

const defaultForm = {
  name: '', sku: '', barcode: '', description: '', shortDescription: '',
  normalPrice: '', discountPrice: '', stock: '0', shippingTime: '',
  isActive: true, isFeatured: false, isBestSeller: false, isNew: false,
  brandId: '', categoryId: '', storeId: '', seoTitle: '', seoDescription: '',
}

export default function ProductsTab() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<OptionItem[]>([])
  const [brands, setBrands] = useState<OptionItem[]>([])
  const [stores, setStores] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStore, setFilterStore] = useState('')

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ admin: 'true', limit: '100' })
    if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory)
    if (filterBrand && filterBrand !== 'all') params.set('brand', filterBrand)
    if (filterStore && filterStore !== 'all') params.set('store', filterStore)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => setProducts(d.products || d))
      .catch(() => toast.error('Ürünler yüklenemedi'))
      .finally(() => setLoading(false))
  }, [filterCategory, filterBrand, filterStore])

  const fetchOptions = useCallback(() => {
    fetch('/api/categories?flat=true').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/stores').then(r => r.json()).then(d => setStores(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchOptions() }, [fetchOptions])

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }

  const openEdit = (p: ProductItem) => {
    setEditing(p)
    setForm({
      name: p.name, sku: p.sku || '', barcode: p.barcode || '',
      description: p.description || '', shortDescription: p.shortDescription || '',
      normalPrice: String(p.normalPrice), discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      stock: String(p.stock), shippingTime: p.shippingTime || '',
      isActive: p.isActive, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNew: p.isNew,
      brandId: p.brandId || '', categoryId: p.categoryId || '', storeId: p.storeId || '',
      seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Ürün adı zorunludur'); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        normalPrice: parseFloat(form.normalPrice) || 0,
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        stock: parseInt(form.stock) || 0,
        brandId: form.brandId || null,
        categoryId: form.categoryId || null,
        storeId: form.storeId || null,
      }
      if (editing) {
        await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Ürün güncellendi')
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Ürün oluşturuldu')
      }
      setDialogOpen(false)
      fetchProducts()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast.success('Ürün silindi')
      fetchProducts()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Ürünler</h3>
        <Button onClick={openNew} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Ürün
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Marka" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {brands.map(b => <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mağaza" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {stores.map(s => <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Mağaza</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>İndirimli</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover" /> : <Package className="w-4 h-4 text-gray-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{p.name}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{p.sku || '-'}</TableCell>
                    <TableCell className="text-xs">{p.category?.name || '-'}</TableCell>
                    <TableCell className="text-xs">{p.brand?.name || '-'}</TableCell>
                    <TableCell className="text-xs">{p.store?.name || '-'}</TableCell>
                    <TableCell className="text-sm">₺{p.normalPrice.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-sm text-[#F27A1A] font-semibold">
                      {p.discountPrice ? `₺${p.discountPrice.toLocaleString('tr-TR')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.stock < 10 ? 'destructive' : 'secondary'} className="text-xs">{p.stock}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {p.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-gray-500">Ürün bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 sm:col-span-2"><Label>Ürün Adı *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Barkod</Label><Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Normal Fiyat *</Label><Input type="number" step="0.01" value={form.normalPrice} onChange={e => setForm(f => ({ ...f, normalPrice: e.target.value }))} /></div>
            <div className="space-y-2"><Label>İndirimli Fiyat</Label><Input type="number" step="0.01" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Stok</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Kargo Süresi</Label><Input value={form.shippingTime} onChange={e => setForm(f => ({ ...f, shippingTime: e.target.value }))} placeholder="1-2 gün" /></div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marka</Label>
              <Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mağaza</Label>
              <Select value={form.storeId} onValueChange={v => setForm(f => ({ ...f, storeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4 sm:col-span-2 pt-2">
              {([['isActive', 'Aktif'], ['isFeatured', 'Öne Çıkan'], ['isBestSeller', 'Çok Satan'], ['isNew', 'Yeni']] as const).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Switch checked={form[key] as boolean} onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))} />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
            <div className="sm:col-span-2 space-y-2"><Label>Kısa Açıklama</Label><Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Açıklama</Label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
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
