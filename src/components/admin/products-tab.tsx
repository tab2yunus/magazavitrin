'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus, Pencil, Trash2, Package, Search, AlertTriangle,
  CheckCircle2, XCircle, Info, ImagePlus, X, GripVertical,
  Globe, Share2, FileText, BarChart3, Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────
interface ProductImage {
  id?: string
  url: string
  alt?: string
}

interface ProductAttribute {
  id?: string
  name: string
  value: string
}

interface ProductItem {
  id: string
  name: string
  slug: string
  sku?: string
  barcode?: string
  oemCode?: string
  productCode?: string
  description?: string
  shortDescription?: string
  normalPrice: number
  discountPrice?: number
  stock: number
  stockStatus?: string
  criticalStock?: number
  shippingWeight?: number
  shippingVolume?: number
  shippingTime?: string
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  isNew: boolean
  publishStatus?: string
  scheduledAt?: string
  brandId?: string
  categoryId?: string
  storeId?: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  canonicalUrl?: string
  noindex?: boolean
  nofollow?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  schemaEnabled?: boolean
  gtin?: string
  mpn?: string
  schemaCondition?: string
  schemaAvailability?: string
  brand?: { id: string; name: string }
  category?: { id: string; name: string; parentId?: string }
  store?: { id: string; name: string }
  images?: ProductImage[]
  attributes?: ProductAttribute[]
}

interface OptionItem { id: string; name: string; slug: string; parentId?: string }

// ─── Turkish Slug Generator ──────────────────────────────
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Default Form ────────────────────────────────────────
const defaultForm = {
  name: '', slug: '', sku: '', barcode: '', oemCode: '', productCode: '',
  description: '', shortDescription: '',
  normalPrice: '', discountPrice: '', stock: '0',
  stockStatus: 'instock' as string, criticalStock: '5',
  shippingWeight: '', shippingVolume: '', shippingTime: '',
  isActive: true, isFeatured: false, isBestSeller: false, isNew: false,
  publishStatus: 'active' as string, scheduledAt: '',
  brandId: '', categoryId: '', storeId: '',
  // SEO
  seoTitle: '', seoDescription: '', focusKeyword: '', canonicalUrl: '',
  noindex: false, nofollow: false,
  // OG
  ogTitle: '', ogDescription: '', ogImage: '',
  // Twitter
  twitterTitle: '', twitterDescription: '', twitterImage: '',
  // Schema
  schemaEnabled: true, gtin: '', mpn: '',
  schemaCondition: 'NewCondition' as string, schemaAvailability: 'InStock' as string,
}

// ─── SEO Score Calculator ────────────────────────────────
function calculateSeoScore(form: typeof defaultForm, images: ProductImage[]): { score: number; checks: { label: string; passed: boolean; points: number }[] } {
  const checks = [
    { label: 'SEO başlığı mevcut', passed: !!form.seoTitle, points: 10 },
    { label: 'SEO başlığı ideal uzunlukta (30-60)', passed: form.seoTitle.length >= 30 && form.seoTitle.length <= 60, points: 10 },
    { label: 'Meta açıklama mevcut', passed: !!form.seoDescription, points: 10 },
    { label: 'Meta açıklama ideal uzunlukta (120-160)', passed: form.seoDescription.length >= 120 && form.seoDescription.length <= 160, points: 10 },
    { label: 'Odak anahtar kelime mevcut', passed: !!form.focusKeyword, points: 10 },
    { label: 'Anahtar kelime başlıkta', passed: !!form.focusKeyword && !!form.seoTitle && form.seoTitle.toLowerCase().includes(form.focusKeyword.toLowerCase()), points: 10 },
    { label: 'Anahtar kelime açıklamada', passed: !!form.focusKeyword && !!form.seoDescription && form.seoDescription.toLowerCase().includes(form.focusKeyword.toLowerCase()), points: 10 },
    { label: 'Ürün görseli mevcut', passed: images.length > 0 && !!images[0]?.url, points: 10 },
    { label: 'Görsel alt etiketi mevcut', passed: images.length > 0 && !!images[0]?.alt, points: 10 },
    { label: 'Canonical URL mevcut', passed: !!form.canonicalUrl, points: 5 },
    { label: 'Schema etkin', passed: form.schemaEnabled, points: 5 },
  ]

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0)
  return { score, checks }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

function getProgressColor(score: number): string {
  if (score >= 80) return '[&>div]:bg-green-500'
  if (score >= 50) return '[&>div]:bg-orange-500'
  return '[&>div]:bg-red-500'
}

// ─── Publish Status Badge ────────────────────────────────
function PublishStatusBadge({ status }: { status?: string }) {
  const s = status || 'active'
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
    passive: { label: 'Pasif', className: 'bg-gray-100 text-gray-800' },
    draft: { label: 'Taslak', className: 'bg-yellow-100 text-yellow-800' },
    archived: { label: 'Arşivlendi', className: 'bg-purple-100 text-purple-800' },
    scheduled: { label: 'Zamanlanmış', className: 'bg-blue-100 text-blue-800' },
  }
  const c = config[s] || config.active
  return <Badge className={c.className}>{c.label}</Badge>
}

// ─── Stock Status Badge ──────────────────────────────────
function StockStatusBadge({ status }: { status?: string }) {
  const s = status || 'instock'
  const config: Record<string, { label: string; className: string }> = {
    instock: { label: 'Stokta', className: 'bg-green-100 text-green-800' },
    outofstock: { label: 'Tükendi', className: 'bg-red-100 text-red-800' },
    preorder: { label: 'Ön Sipariş', className: 'bg-blue-100 text-blue-800' },
    comingsoon: { label: 'Yakında', className: 'bg-yellow-100 text-yellow-800' },
  }
  const c = config[s] || config.instock
  return <Badge className={c.className}>{c.label}</Badge>
}

// ─── Main Component ──────────────────────────────────────
export default function ProductsTab() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<OptionItem[]>([])
  const [brands, setBrands] = useState<OptionItem[]>([])
  const [stores, setStores] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [images, setImages] = useState<ProductImage[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [saving, setSaving] = useState(false)
  const [slugWarning, setSlugWarning] = useState(false)
  const [discountError, setDiscountError] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStore, setFilterStore] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Check slug uniqueness
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug) { setSlugWarning(false); return }
    try {
      const res = await fetch(`/api/products/${slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.id && data.id !== editing?.id) {
          setSlugWarning(true)
        } else {
          setSlugWarning(false)
        }
      } else {
        setSlugWarning(false)
      }
    } catch {
      setSlugWarning(false)
    }
  }, [editing])

  const openNew = () => {
    setEditing(null)
    setForm(defaultForm)
    setImages([])
    setAttributes([])
    setSlugWarning(false)
    setDiscountError(false)
    setActiveTab('basic')
    setDialogOpen(true)
  }

  const openEdit = async (p: ProductItem) => {
    setEditing(p)
    setActiveTab('basic')

    // Fetch full product data with attributes and images
    try {
      const res = await fetch(`/api/products/${p.id}`)
      if (res.ok) {
        const full = await res.json()
        setForm({
          name: full.name || '',
          slug: full.slug || '',
          sku: full.sku || '',
          barcode: full.barcode || '',
          oemCode: full.oemCode || '',
          productCode: full.productCode || '',
          description: full.description || '',
          shortDescription: full.shortDescription || '',
          normalPrice: String(full.normalPrice ?? ''),
          discountPrice: full.discountPrice ? String(full.discountPrice) : '',
          stock: String(full.stock ?? 0),
          stockStatus: full.stockStatus || 'instock',
          criticalStock: String(full.criticalStock ?? 5),
          shippingWeight: full.shippingWeight ? String(full.shippingWeight) : '',
          shippingVolume: full.shippingVolume ? String(full.shippingVolume) : '',
          shippingTime: full.shippingTime || '',
          isActive: full.isActive ?? true,
          isFeatured: full.isFeatured ?? false,
          isBestSeller: full.isBestSeller ?? false,
          isNew: full.isNew ?? false,
          publishStatus: full.publishStatus || 'active',
          scheduledAt: full.scheduledAt ? new Date(full.scheduledAt).toISOString().slice(0, 16) : '',
          brandId: full.brandId || '',
          categoryId: full.categoryId || '',
          storeId: full.storeId || '',
          seoTitle: full.seoTitle || '',
          seoDescription: full.seoDescription || '',
          focusKeyword: full.focusKeyword || '',
          canonicalUrl: full.canonicalUrl || '',
          noindex: full.noindex ?? false,
          nofollow: full.nofollow ?? false,
          ogTitle: full.ogTitle || '',
          ogDescription: full.ogDescription || '',
          ogImage: full.ogImage || '',
          twitterTitle: full.twitterTitle || '',
          twitterDescription: full.twitterDescription || '',
          twitterImage: full.twitterImage || '',
          schemaEnabled: full.schemaEnabled ?? true,
          gtin: full.gtin || '',
          mpn: full.mpn || '',
          schemaCondition: full.schemaCondition || 'NewCondition',
          schemaAvailability: full.schemaAvailability || 'InStock',
        })
        setImages(full.images || [])
        setAttributes(full.attributes || [])
      }
    } catch {
      // Fallback to basic data from list
      setForm({
        ...defaultForm,
        name: p.name, slug: p.slug, sku: p.sku || '', barcode: p.barcode || '',
        normalPrice: String(p.normalPrice), discountPrice: p.discountPrice ? String(p.discountPrice) : '',
        stock: String(p.stock), isActive: p.isActive, isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller, isNew: p.isNew, brandId: p.brandId || '',
        categoryId: p.categoryId || '', storeId: p.storeId || '',
        seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '',
      })
      setImages(p.images || [])
      setAttributes([])
    }

    setSlugWarning(false)
    setDiscountError(false)
    setDialogOpen(true)
  }

  // Validate discount price
  useEffect(() => {
    if (form.discountPrice && form.normalPrice) {
      setDiscountError(parseFloat(form.discountPrice) > parseFloat(form.normalPrice))
    } else {
      setDiscountError(false)
    }
  }, [form.discountPrice, form.normalPrice])

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Ürün adı zorunludur'); return }
    if (discountError) { toast.error('İndirimli fiyat normal fiyattan yüksek olamaz'); return }
    if (slugWarning) { toast.error('Bu slug zaten kullanılıyor, lütfen değiştirin'); return }

    setSaving(true)
    try {
      const body = {
        ...form,
        normalPrice: parseFloat(form.normalPrice) || 0,
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        stock: parseInt(form.stock) || 0,
        criticalStock: parseInt(form.criticalStock) || 5,
        shippingWeight: form.shippingWeight ? parseFloat(form.shippingWeight) : null,
        shippingVolume: form.shippingVolume ? parseFloat(form.shippingVolume) : null,
        brandId: form.brandId || null,
        categoryId: form.categoryId || null,
        storeId: form.storeId || null,
        scheduledAt: form.scheduledAt || null,
        images: images.filter(img => img.url),
        attributes: attributes.filter(a => a.name && a.value),
      }

      if (editing) {
        await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        toast.success('Ürün güncellendi')
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        toast.success('Ürün oluşturuldu')
      }
      setDialogOpen(false)
      fetchProducts()
    } catch {
      toast.error('Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast.success('Ürün silindi')
      fetchProducts()
    } catch {
      toast.error('Silme başarısız')
    }
  }

  // Image helpers
  const addImage = () => {
    if (!newImageUrl.trim()) return
    setImages(prev => [...prev, { url: newImageUrl.trim(), alt: newImageAlt.trim() }])
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, field: 'url' | 'alt', value: string) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, [field]: value } : img))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const newArr = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newArr.length) return prev
      ;[newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]]
      return newArr
    })
  }

  // Attribute helpers
  const addAttribute = () => {
    setAttributes(prev => [...prev, { name: '', value: '' }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  // SEO Score
  const seoResult = calculateSeoScore(form, images)

  // Google Preview
  const googleTitle = form.seoTitle || form.name || 'Ürün Başlığı'
  const googleDescription = form.seoDescription || form.shortDescription || 'Ürün açıklaması bulunmuyor...'
  const googleUrl = `example.com/urun/${form.slug || 'urun-slug'}`

  // Build category tree
  const buildCategoryTree = (items: OptionItem[]) => {
    const roots = items.filter(c => !c.parentId)
    const renderTree = (items: OptionItem[], depth: number = 0): React.ReactNode[] => {
      const result: React.ReactNode[] = []
      for (const item of items) {
        const children = categories.filter(c => c.parentId === item.id)
        result.push(
          <SelectItem key={item.id} value={item.id} className={depth > 0 ? `pl-${8 + depth * 4}` : ''}>
            {'  '.repeat(depth)}{item.name}
          </SelectItem>
        )
        if (children.length > 0) {
          result.push(...renderTree(children, depth + 1))
        }
      }
      return result
    }
    return renderTree(roots)
  }

  // Filter products by search
  const filteredProducts = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Ürünler</h3>
        <Button onClick={openNew} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Ürün
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Ürün adı veya SKU ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {/* Product Table */}
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
                  <TableHead>Fiyat</TableHead>
                  <TableHead>İndirimli</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Stok Durumu</TableHead>
                  <TableHead>Yayın Durumu</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{p.sku || '-'}</TableCell>
                    <TableCell className="text-xs">{p.category?.name || '-'}</TableCell>
                    <TableCell className="text-xs">{p.brand?.name || '-'}</TableCell>
                    <TableCell className="text-sm">₺{p.normalPrice.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-sm text-[#F27A1A] font-semibold">
                      {p.discountPrice ? `₺${p.discountPrice.toLocaleString('tr-TR')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.stock < (p.criticalStock || 5) ? 'destructive' : 'secondary'} className="text-xs">
                        {p.stock}
                      </Badge>
                    </TableCell>
                    <TableCell><StockStatusBadge status={p.stockStatus} /></TableCell>
                    <TableCell><PublishStatusBadge status={p.publishStatus} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">Ürün bulunamadı</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Product Edit Dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[92vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-lg font-semibold text-[#0F1B2D]">
              {editing ? 'Ürün Düzenle' : 'Yeni Ürün'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="w-full flex flex-wrap gap-1 h-auto bg-gray-50 p-1 rounded-lg mb-4">
                <TabsTrigger value="basic" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  <FileText className="w-3 h-3 mr-1" /> Temel Bilgiler
                </TabsTrigger>
                <TabsTrigger value="price" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  ₺ Fiyat & Stok
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  <ImagePlus className="w-3 h-3 mr-1" /> Görseller
                </TabsTrigger>
                <TabsTrigger value="category" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  🏷️ Kategori & Marka
                </TabsTrigger>
                <TabsTrigger value="description" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  📝 Açıklama
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  <Globe className="w-3 h-3 mr-1" /> SEO
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  <Share2 className="w-3 h-3 mr-1" /> Sosyal
                </TabsTrigger>
                <TabsTrigger value="schema" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  🔧 Schema
                </TabsTrigger>
                <TabsTrigger value="publish" className="text-xs data-[state=active]:bg-[#0F1B2D] data-[state=active]:text-white">
                  <Calendar className="w-3 h-3 mr-1" /> Yayın Durumu
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pb-4 pr-1" style={{ maxHeight: 'calc(92vh - 180px)' }}>

                {/* ─── Tab 1: Basic Info ──────────────────────── */}
                <TabsContent value="basic" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Ürün Adı *</Label>
                      <Input
                        value={form.name}
                        onChange={e => {
                          const name = e.target.value
                          setForm(f => ({
                            ...f,
                            name,
                            slug: f.slug === generateSlug(f.name) ? generateSlug(name) : f.slug,
                          }))
                        }}
                        placeholder="Ürün adını girin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <div className="relative">
                        <Input
                          value={form.slug}
                          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                          onBlur={() => checkSlug(form.slug)}
                          className={slugWarning ? 'border-red-500 pr-8' : ''}
                          placeholder="urun-slug"
                        />
                        {slugWarning && (
                          <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {slugWarning && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Bu slug zaten kullanılıyor!
                        </p>
                      )}
                      <p className="text-xs text-gray-400">Boş bırakılırsa otomatik oluşturulur</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Durum</Label>
                      <Select value={form.isActive ? 'active' : 'passive'} onValueChange={v => setForm(f => ({ ...f, isActive: v === 'active' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="passive">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU kodu" />
                    </div>

                    <div className="space-y-2">
                      <Label>Barkod</Label>
                      <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Barkod numarası" />
                    </div>

                    <div className="space-y-2">
                      <Label>OEM Kodu</Label>
                      <Input value={form.oemCode} onChange={e => setForm(f => ({ ...f, oemCode: e.target.value }))} placeholder="OEM kodu" />
                    </div>

                    <div className="space-y-2">
                      <Label>Ürün Kodu</Label>
                      <Input value={form.productCode} onChange={e => setForm(f => ({ ...f, productCode: e.target.value }))} placeholder="Ürün kodu" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Kısa Açıklama</Label>
                      <Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Kısa ürün açıklaması" />
                    </div>

                    <div className="flex flex-wrap gap-4 md:col-span-2 pt-2">
                      {([
                        ['isFeatured', 'Öne Çıkan'],
                        ['isBestSeller', 'Çok Satan'],
                        ['isNew', 'Yeni'],
                      ] as const).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Switch checked={form[key] as boolean} onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))} />
                          <Label className="text-sm">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 2: Price & Stock ───────────────────── */}
                <TabsContent value="price" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Normal Fiyat (₺) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.normalPrice}
                        onChange={e => setForm(f => ({ ...f, normalPrice: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>İndirimli Fiyat (₺)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.discountPrice}
                        onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                        className={discountError ? 'border-red-500' : ''}
                        placeholder="0.00"
                      />
                      {discountError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> İndirimli fiyat normal fiyattan yüksek olamaz!
                        </p>
                      )}
                    </div>

                    {form.normalPrice && form.discountPrice && !discountError && (
                      <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          💰 İndirim oranı: <strong>%{Math.round((1 - parseFloat(form.discountPrice) / parseFloat(form.normalPrice)) * 100)}</strong>
                          {' '}— Müşteri <strong>₺{(parseFloat(form.normalPrice) - parseFloat(form.discountPrice)).toFixed(2)}</strong> tasarruf edecek
                        </p>
                      </div>
                    )}

                    <Separator className="md:col-span-2" />

                    <div className="space-y-2">
                      <Label>Stok Adedi</Label>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stok Durumu</Label>
                      <Select value={form.stockStatus} onValueChange={v => setForm(f => ({ ...f, stockStatus: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instock">Stokta</SelectItem>
                          <SelectItem value="outofstock">Tükendi</SelectItem>
                          <SelectItem value="preorder">Ön Sipariş</SelectItem>
                          <SelectItem value="comingsoon">Yakında</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kritik Stok Eşiği</Label>
                      <Input
                        type="number"
                        value={form.criticalStock}
                        onChange={e => setForm(f => ({ ...f, criticalStock: e.target.value }))}
                        placeholder="5"
                      />
                      <p className="text-xs text-gray-400">Bu sayının altına inince uyarı gösterilir</p>
                    </div>

                    <Separator className="md:col-span-2" />

                    <div className="space-y-2">
                      <Label>Kargo Ağırlığı (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.shippingWeight}
                        onChange={e => setForm(f => ({ ...f, shippingWeight: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Kargo Hacmi (Desi)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.shippingVolume}
                        onChange={e => setForm(f => ({ ...f, shippingVolume: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Kargo Süresi</Label>
                      <Input
                        value={form.shippingTime}
                        onChange={e => setForm(f => ({ ...f, shippingTime: e.target.value }))}
                        placeholder="1-2 iş günü"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 3: Images ──────────────────────────── */}
                <TabsContent value="images" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    {/* Add new image */}
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-sm font-medium mb-3 text-[#0F1B2D]">Yeni Görsel Ekle</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                          placeholder="Görsel URL"
                          className="flex-1"
                        />
                        <Input
                          value={newImageAlt}
                          onChange={e => setNewImageAlt(e.target.value)}
                          placeholder="Alt etiketi"
                          className="flex-1"
                        />
                        <Button type="button" onClick={addImage} variant="outline" className="shrink-0">
                          <ImagePlus className="w-4 h-4 mr-1" /> Ekle
                        </Button>
                      </div>
                    </div>

                    {/* Image list */}
                    {images.length > 0 ? (
                      <div className="space-y-2">
                        {images.map((img, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveImage(index, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveImage(index, 'down')}
                                disabled={index === images.length - 1}
                              >
                                ↓
                              </Button>
                            </div>

                            {/* Preview */}
                            <div className="w-16 h-16 rounded border bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              {img.url ? (
                                <img src={img.url} alt={img.alt || ''} className="w-16 h-16 object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-300" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <Input
                                value={img.url}
                                onChange={e => updateImage(index, 'url', e.target.value)}
                                placeholder="Görsel URL"
                                className="text-xs h-8"
                              />
                              <Input
                                value={img.alt || ''}
                                onChange={e => updateImage(index, 'alt', e.target.value)}
                                placeholder="Alt etiketi (SEO)"
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="shrink-0">
                              {index === 0 && (
                                <Badge className="bg-[#F27A1A] text-white text-xs mr-2">Kapak</Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Henüz görsel eklenmedi</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ─── Tab 4: Category & Brand ────────────────── */}
                <TabsContent value="category" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marka</Label>
                      <Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Marka seçin" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Seçilmedi</SelectItem>
                          {brands.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Seçilmedi</SelectItem>
                          {buildCategoryTree(categories)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Mağaza</Label>
                      <Select value={form.storeId} onValueChange={v => setForm(f => ({ ...f, storeId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Mağaza seçin" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Seçilmedi</SelectItem>
                          {stores.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 5: Description ─────────────────────── */}
                <TabsContent value="description" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Kısa Açıklama</Label>
                      <Input
                        value={form.shortDescription}
                        onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                        placeholder="Ürünün kısa açıklaması"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Detaylı Açıklama</Label>
                      <Textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Ürünün detaylı açıklamasını yazın..."
                        className="min-h-[150px]"
                      />
                    </div>

                    <Separator />

                    {/* Technical Specs / Attributes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Teknik Özellikler</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                          <Plus className="w-3 h-3 mr-1" /> Özellik Ekle
                        </Button>
                      </div>

                      {attributes.length > 0 ? (
                        <div className="space-y-2">
                          {attributes.map((attr, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={attr.name}
                                onChange={e => updateAttribute(index, 'name', e.target.value)}
                                placeholder="Özellik adı"
                                className="flex-1"
                              />
                              <Input
                                value={attr.value}
                                onChange={e => updateAttribute(index, 'value', e.target.value)}
                                placeholder="Değer"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-red-500"
                                onClick={() => removeAttribute(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">Henüz teknik özellik eklenmedi</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 6: SEO ─────────────────────────────── */}
                <TabsContent value="seo" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* SEO Form - Left */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>SEO Başlık</Label>
                          <span className={`text-xs ${form.seoTitle.length >= 30 && form.seoTitle.length <= 60 ? 'text-green-600' : 'text-gray-400'}`}>
                            {form.seoTitle.length}/60
                          </span>
                        </div>
                        <Input
                          value={form.seoTitle}
                          onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value.slice(0, 70) }))}
                          placeholder="SEO başlığı (30-60 karakter)"
                          className={form.seoTitle.length > 0 && (form.seoTitle.length < 30 || form.seoTitle.length > 60) ? 'border-orange-400' : ''}
                        />
                        {form.seoTitle.length > 0 && form.seoTitle.length < 30 && (
                          <p className="text-xs text-orange-500">Önerilen minimum uzunluk: 30 karakter</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Meta Açıklama</Label>
                          <span className={`text-xs ${form.seoDescription.length >= 120 && form.seoDescription.length <= 160 ? 'text-green-600' : 'text-gray-400'}`}>
                            {form.seoDescription.length}/160
                          </span>
                        </div>
                        <Textarea
                          value={form.seoDescription}
                          onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value.slice(0, 170) }))}
                          placeholder="Meta açıklama (120-160 karakter)"
                          className={form.seoDescription.length > 0 && (form.seoDescription.length < 120 || form.seoDescription.length > 160) ? 'border-orange-400' : ''}
                          rows={3}
                        />
                        {form.seoDescription.length > 0 && form.seoDescription.length < 120 && (
                          <p className="text-xs text-orange-500">Önerilen minimum uzunluk: 120 karakter</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Odak Anahtar Kelime</Label>
                        <Input
                          value={form.focusKeyword}
                          onChange={e => setForm(f => ({ ...f, focusKeyword: e.target.value }))}
                          placeholder="Anahtar kelime"
                        />
                        {form.focusKeyword && (
                          <div className="text-xs space-y-1">
                            <p className={form.seoTitle.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'text-green-600' : 'text-red-500'}>
                              {form.seoTitle.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? '✓' : '✗'} Başlıkta {' '}
                              {form.seoTitle.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'bulunuyor' : 'bulunmuyor'}
                            </p>
                            <p className={form.seoDescription.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'text-green-600' : 'text-red-500'}>
                              {form.seoDescription.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? '✓' : '✗'} Açıklamada {' '}
                              {form.seoDescription.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'bulunuyor' : 'bulunmuyor'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Canonical URL</Label>
                        <Input
                          value={form.canonicalUrl}
                          onChange={e => setForm(f => ({ ...f, canonicalUrl: e.target.value }))}
                          placeholder="https://example.com/urun/slug"
                        />
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                          <Switch checked={form.noindex} onCheckedChange={v => setForm(f => ({ ...f, noindex: v }))} />
                          <Label className="text-sm">Noindex</Label>
                          <span className="text-xs text-gray-400">(Arama motorlarında gösterme)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={form.nofollow} onCheckedChange={v => setForm(f => ({ ...f, nofollow: v }))} />
                          <Label className="text-sm">Nofollow</Label>
                          <span className="text-xs text-gray-400">(Linkleri takip etme)</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Google Preview */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1"><Globe className="w-4 h-4" /> Google Önizleme</Label>
                        <div className="p-4 bg-white border rounded-lg shadow-sm">
                          <p className="text-xs text-green-700 truncate">{googleUrl}</p>
                          <p className="text-lg text-blue-700 hover:underline cursor-pointer line-clamp-1 font-normal">
                            {googleTitle}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {googleDescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SEO Score Panel - Right */}
                    <div className="lg:col-span-2">
                      <div className={`p-4 rounded-lg border ${getScoreBg(seoResult.score)} sticky top-0`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm">SEO Puanı</h4>
                          <span className={`text-2xl font-bold ${getScoreColor(seoResult.score)}`}>
                            {seoResult.score}
                          </span>
                        </div>
                        <Progress value={seoResult.score} className={`h-2 mb-4 ${getProgressColor(seoResult.score)}`} />
                        <div className="space-y-2">
                          {seoResult.checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {check.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              )}
                              <span className={check.passed ? 'text-gray-700' : 'text-gray-400'}>
                                {check.label}
                              </span>
                              <span className="ml-auto text-gray-400">+{check.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 7: Social Sharing ──────────────────── */}
                <TabsContent value="social" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Open Graph */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-[#0F1B2D] mb-2">Open Graph (Facebook, vb.)</h4>
                        <p className="text-xs text-gray-400 mb-3">Boş bırakılırsa SEO başlığı/açıklaması/ürün görseli kullanılır</p>
                      </div>

                      <div className="space-y-2">
                        <Label>OG Başlık</Label>
                        <Input
                          value={form.ogTitle}
                          onChange={e => setForm(f => ({ ...f, ogTitle: e.target.value }))}
                          placeholder={form.seoTitle || 'SEO başlığı kullanılacak'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>OG Açıklama</Label>
                        <Input
                          value={form.ogDescription}
                          onChange={e => setForm(f => ({ ...f, ogDescription: e.target.value }))}
                          placeholder={form.seoDescription || 'Meta açıklaması kullanılacak'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>OG Görsel URL</Label>
                        <Input
                          value={form.ogImage}
                          onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
                          placeholder={images[0]?.url || 'Ürün görseli kullanılacak'}
                        />
                        {form.ogImage && (
                          <div className="w-24 h-24 rounded border overflow-hidden mt-1">
                            <img src={form.ogImage} alt="OG Preview" className="w-24 h-24 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Twitter */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-[#0F1B2D] mb-2">Twitter Card</h4>
                        <p className="text-xs text-gray-400 mb-3">Boş bırakılırsa OG veya SEO değerleri kullanılır</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Twitter Başlık</Label>
                        <Input
                          value={form.twitterTitle}
                          onChange={e => setForm(f => ({ ...f, twitterTitle: e.target.value }))}
                          placeholder={form.ogTitle || form.seoTitle || 'OG/SEO başlığı kullanılacak'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Twitter Açıklama</Label>
                        <Input
                          value={form.twitterDescription}
                          onChange={e => setForm(f => ({ ...f, twitterDescription: e.target.value }))}
                          placeholder={form.ogDescription || form.seoDescription || 'OG/SEO açıklaması kullanılacak'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Twitter Görsel URL</Label>
                        <Input
                          value={form.twitterImage}
                          onChange={e => setForm(f => ({ ...f, twitterImage: e.target.value }))}
                          placeholder={form.ogImage || images[0]?.url || 'OG/Ürün görseli kullanılacak'}
                        />
                        {form.twitterImage && (
                          <div className="w-24 h-24 rounded border overflow-hidden mt-1">
                            <img src={form.twitterImage} alt="Twitter Preview" className="w-24 h-24 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ─── Tab 8: Schema ──────────────────────────── */}
                <TabsContent value="schema" className="mt-0 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Switch checked={form.schemaEnabled} onCheckedChange={v => setForm(f => ({ ...f, schemaEnabled: v }))} />
                    <Label>Schema.org İşaretleme Etkin</Label>
                  </div>

                  {form.schemaEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GTIN</Label>
                        <Input
                          value={form.gtin}
                          onChange={e => setForm(f => ({ ...f, gtin: e.target.value }))}
                          placeholder="Global Trade Item Number"
                        />
                        <p className="text-xs text-gray-400">EAN, UPC, JAN veya ISBN13 kodu</p>
                      </div>

                      <div className="space-y-2">
                        <Label>MPN</Label>
                        <Input
                          value={form.mpn}
                          onChange={e => setForm(f => ({ ...f, mpn: e.target.value }))}
                          placeholder="Manufacturer Part Number"
                        />
                        <p className="text-xs text-gray-400">Üretici parça numarası</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Durum</Label>
                        <Select value={form.schemaCondition} onValueChange={v => setForm(f => ({ ...f, schemaCondition: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NewCondition">Yeni</SelectItem>
                            <SelectItem value="UsedCondition">İkinci El</SelectItem>
                            <SelectItem value="RefurbishedCondition">Yenilenmiş</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Kullanılabilirlik</Label>
                        <Select value={form.schemaAvailability} onValueChange={v => setForm(f => ({ ...f, schemaAvailability: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="InStock">Stokta</SelectItem>
                            <SelectItem value="OutOfStock">Stokta Yok</SelectItem>
                            <SelectItem value="PreOrder">Ön Sipariş</SelectItem>
                            <SelectItem value="BackOrder">Tedarik Sürecinde</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {!form.schemaEnabled && (
                    <div className="text-center py-8 text-gray-400">
                      <p>Schema işaretleme devre dışı</p>
                      <p className="text-xs mt-1">Etkinleştirmek için üstteki düğmeyi açın</p>
                    </div>
                  )}
                </TabsContent>

                {/* ─── Tab 9: Publish Status ──────────────────── */}
                <TabsContent value="publish" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    {([
                      { value: 'active', label: 'Aktif', desc: 'Ürün yayında ve görünür', color: 'bg-green-100 border-green-300' },
                      { value: 'passive', label: 'Pasif', desc: 'Ürün yayında değil', color: 'bg-gray-100 border-gray-300' },
                      { value: 'draft', label: 'Taslak', desc: 'Ürün henüz tamamlanmadı', color: 'bg-yellow-100 border-yellow-300' },
                      { value: 'archived', label: 'Arşivlendi', desc: 'Ürün arşivlendi', color: 'bg-purple-100 border-purple-300' },
                      { value: 'scheduled', label: 'Zamanlanmış', desc: 'Ürün belirli bir tarihte yayınlanacak', color: 'bg-blue-100 border-blue-300' },
                    ] as const).map(status => (
                      <label
                        key={status.value}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          form.publishStatus === status.value
                            ? `${status.color} border-current`
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="publishStatus"
                          value={status.value}
                          checked={form.publishStatus === status.value}
                          onChange={e => setForm(f => ({ ...f, publishStatus: e.target.value }))}
                          className="accent-[#0F1B2D]"
                        />
                        <div>
                          <p className="font-medium text-sm">{status.label}</p>
                          <p className="text-xs text-gray-500">{status.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {form.publishStatus === 'scheduled' && (
                    <div className="space-y-2 mt-4">
                      <Label>Yayın Tarihi ve Saati</Label>
                      <Input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                      />
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
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
