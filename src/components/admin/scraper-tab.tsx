'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Download, Trash2, RefreshCw, Search, Database, Loader2,
  CheckCircle, XCircle, AlertTriangle, Package, Upload,
  Eye, EyeOff, Settings2, TrendingUp, Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ImportedProduct {
  id: string
  sourceSupplier: string
  sourceProductId: string
  productName: string
  description: string | null
  category: string | null
  brand: string | null
  model: string | null
  sku: string | null
  barcode: string | null
  stock: number
  supplierPrice: number
  imageUrls: string | null
  sourceUrl: string | null
  isPublished: boolean
  publishedProductId: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface ScraperLog {
  id: string
  jobType: string
  status: string
  totalScraped: number
  totalSaved: number
  totalDuplicates: number
  totalErrors: number
  categories: number
  errorMessage: string | null
  startedAt: string
  completedAt: string | null
}

interface PublishStatus {
  totalImported: number
  totalPublished: number
  totalUnpublished: number
}

export default function ScraperTab() {
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [logs, setLogs] = useState<ScraperLog[]>([])
  const [publishStatus, setPublishStatus] = useState<PublishStatus>({ totalImported: 0, totalPublished: 0, totalUnpublished: 0 })
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<any>(null)
  const [publishResult, setPublishResult] = useState<any>(null)
  const [markupPercent, setMarkupPercent] = useState(30)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        search,
        category: categoryFilter,
      })
      const res = await fetch(`/api/scraper/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setTotalProducts(data.total || 0)
        setTotalPages(data.totalPages || 1)
        if (data.categories) setCategories(data.categories)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, search, categoryFilter])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/scraper/status')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch { /* ignore */ }
  }, [])

  const fetchPublishStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/scraper/publish')
      if (res.ok) {
        const data = await res.json()
        setPublishStatus(data)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchLogs()
    fetchPublishStatus()
  }, [fetchProducts, fetchLogs, fetchPublishStatus])

  async function handleScrape(maxProducts: number = 0) {
    setScraping(true)
    setScrapeResult(null)
    try {
      const res = await fetch('/api/scraper/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxProducts: maxProducts || 0, delayMs: 1500 }),
      })
      if (res.ok) {
        const data = await res.json()
        setScrapeResult(data.result)
        fetchProducts()
        fetchLogs()
        fetchPublishStatus()
      } else {
        const data = await res.json()
        setScrapeResult({ error: data.error })
      }
    } catch (err: any) {
      setScrapeResult({ error: err.message })
    } finally {
      setScraping(false)
    }
  }

  async function handlePublish(mode: 'unpublished' | 'all' | 'selected') {
    setPublishing(true)
    setPublishResult(null)
    try {
      const body: any = {
        mode,
        markupPercent,
      }
      if (mode === 'selected') {
        body.productIds = Array.from(selectedProducts)
      }
      const res = await fetch('/api/scraper/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        setPublishResult(data)
        fetchProducts()
        fetchPublishStatus()
        setSelectedProducts(new Set())
        setPublishDialogOpen(false)
      } else {
        const data = await res.json()
        setPublishResult({ error: data.error })
      }
    } catch (err: any) {
      setPublishResult({ error: err.message })
    } finally {
      setPublishing(false)
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Tüm içe aktarılan ürünleri silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch('/api/scraper/products', { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
        fetchLogs()
        fetchPublishStatus()
      }
    } catch { /* ignore */ }
  }

  function toggleProduct(id: string) {
    setSelectedProducts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('tr-TR')
  }

  // Filter products by publish status
  const filteredProducts = products.filter(p => {
    if (publishedFilter === 'published') return p.isPublished
    if (publishedFilter === 'unpublished') return !p.isPublished
    return true
  })

  const latestLog = logs[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2744] flex items-center gap-2">
            <Database className="w-6 h-6" />
            MOTOLUX Scraper
          </h2>
          <p className="text-sm text-gray-500 mt-1">MOTOLUX bayi portalından ürün çekme ve yayınlama</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Scrape buttons */}
          <Button
            onClick={() => handleScrape(10)}
            disabled={scraping}
            variant="outline"
            className="border-[#F27A1A] text-[#F27A1A] hover:bg-[#FFF3E8]"
          >
            {scraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            10 Test
          </Button>
          <Button
            onClick={() => handleScrape(100)}
            disabled={scraping}
            variant="outline"
            className="border-[#F27A1A] text-[#F27A1A] hover:bg-[#FFF3E8]"
          >
            100 Çek
          </Button>
          <Button
            onClick={() => handleScrape(1000)}
            disabled={scraping}
            variant="outline"
            className="border-[#F27A1A] text-[#F27A1A] hover:bg-[#FFF3E8]"
          >
            1000 Çek
          </Button>
          <Button
            onClick={() => {
              if (confirm('Tüm kategorilerden ürün çekmek uzun sürebilir. Devam etmek istiyor musunuz?')) {
                handleScrape(0)
              }
            }}
            disabled={scraping}
            className="bg-[#F27A1A] hover:bg-[#D4630E] text-white"
          >
            {scraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Tümünü Çek
          </Button>

          {/* Publish button with dialog */}
          <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={publishing || publishStatus.totalUnpublished === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Yayınla ({publishStatus.totalUnpublished})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Ürünleri Yayınla
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-amber-800 mb-1">Nasıl Çalışır?</p>
                  <p className="text-amber-700">
                    İçe aktarılan ürünler <strong>Product</strong> tablosuna dönüştürülür ve marketplace vitrininde görünür hale gelir.
                    Kategori, marka ve mağaza otomatik oluşturulur.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Kar Marjı (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">
                      Satış fiyatı = Alış fiyatı × {1 + markupPercent / 100}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Örnek: Alış 100₺, Marj %30 → Satış 130₺
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-700">{publishStatus.totalImported}</p>
                    <p className="text-xs text-gray-500">Toplam</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{publishStatus.totalPublished}</p>
                    <p className="text-xs text-gray-500">Yayınlanan</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-lg font-bold text-amber-600">{publishStatus.totalUnpublished}</p>
                    <p className="text-xs text-gray-500">Bekleyen</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handlePublish('unpublished')}
                    disabled={publishing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Yayınlanmamış Tümünü Yayınla ({publishStatus.totalUnpublished})
                  </Button>
                  {selectedProducts.size > 0 && (
                    <Button
                      onClick={() => handlePublish('selected')}
                      disabled={publishing}
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Seçilenleri Yayınla ({selectedProducts.size})
                    </Button>
                  )}
                  <Button
                    onClick={() => handlePublish('all')}
                    disabled={publishing}
                    variant="outline"
                    className="w-full"
                  >
                    Tümünü Yeniden Yayınla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleDeleteAll}
            variant="destructive"
            size="icon"
            title="Tümünü Sil"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrape Result */}
      {scrapeResult && (
        <Card className={scrapeResult.error ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
          <CardContent className="p-4">
            {scrapeResult.error ? (
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Hata: {scrapeResult.error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1A2744]">{scrapeResult.totalScraped}</p>
                  <p className="text-xs text-gray-600">Çekilen</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{scrapeResult.totalSaved}</p>
                  <p className="text-xs text-gray-600">Kaydedilen</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{scrapeResult.totalDuplicates}</p>
                  <p className="text-xs text-gray-600">Duplicate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{scrapeResult.totalErrors}</p>
                  <p className="text-xs text-gray-600">Hata</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-500">{scrapeResult.zeroPriceSkipped ?? 0}</p>
                  <p className="text-xs text-gray-600">Fiyatsız Atla</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{scrapeResult.autoPublished ?? 0}</p>
                  <p className="text-xs text-gray-600">Oto-Yayınla</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{scrapeResult.categories}</p>
                  <p className="text-xs text-gray-600">Kategori</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publish Result */}
      {publishResult && (
        <Card className={publishResult.error ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
          <CardContent className="p-4">
            {publishResult.error ? (
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Yayınlama Hatası: {publishResult.error}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{publishResult.message}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto text-[#F27A1A] mb-2" />
            <p className="text-2xl font-bold text-[#1A2744]">{totalProducts}</p>
            <p className="text-xs text-gray-500">İçe Aktarılan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-[#1A2744]">{categories.length}</p>
            <p className="text-xs text-gray-500">Kategori</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">{publishStatus.totalPublished}</p>
            <p className="text-xs text-gray-500">Yayınlanan</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 text-center">
            <Upload className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-600">{publishStatus.totalUnpublished}</p>
            <p className="text-xs text-gray-500">Yayınlanmayı Bekleyen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {publishStatus.totalImported > 0 ? Math.round((publishStatus.totalPublished / publishStatus.totalImported) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">Yayınlama Oranı</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Scraping Log */}
      {latestLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Son Scraping Log
              <Badge variant={latestLog.status === 'completed' ? 'default' : latestLog.status === 'failed' ? 'destructive' : 'secondary'}>
                {latestLog.status === 'completed' ? 'Tamamlandı' : latestLog.status === 'failed' ? 'Başarısız' : 'Çalışıyor'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <div><span className="font-semibold">Tip:</span> {latestLog.jobType}</div>
              <div><span className="font-semibold">Kategori:</span> {latestLog.categories}</div>
              <div><span className="font-semibold">Çekilen:</span> {latestLog.totalScraped}</div>
              <div><span className="font-semibold">Kaydedilen:</span> {latestLog.totalSaved}</div>
              <div><span className="font-semibold">Duplicate:</span> {latestLog.totalDuplicates}</div>
              <div><span className="font-semibold">Hata:</span> {latestLog.totalErrors}</div>
            </div>
            {latestLog.errorMessage && (
              <p className="mt-2 text-red-600">{latestLog.errorMessage}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Ürün adı, SKU, marka ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === '__all__' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Tüm Kategoriler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tüm Kategoriler</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={publishedFilter} onValueChange={setPublishedFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Yayın Durumu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="published">Yayınlanan</SelectItem>
            <SelectItem value="unpublished">Bekleyen</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => { fetchProducts(); fetchLogs(); fetchPublishStatus() }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Selection actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedProducts.size} ürün seçildi
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProducts(new Set())}
            >
              Seçimi Temizle
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handlePublish('selected')}
              disabled={publishing}
            >
              {publishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Seçilenleri Yayınla
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                      onChange={toggleAllVisible}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Ürün Kodu</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Alış Fiyatı</TableHead>
                  <TableHead>Satış Fiyatı</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Görsel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#F27A1A]" />
                      <p className="text-sm text-gray-500 mt-2">Yükleniyor...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                      {publishStatus.totalImported === 0
                        ? 'Henüz içe aktarılan ürün yok. Scraping işlemini başlatın.'
                        : 'Filtreye uygun ürün bulunamadı.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, idx) => {
                    const salePrice = Math.round(product.supplierPrice * (1 + markupPercent / 100) * 100) / 100
                    return (
                      <TableRow
                        key={product.id}
                        className={product.isPublished ? 'bg-green-50/30' : ''}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{(page - 1) * 50 + idx + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{product.productName}</p>
                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-48 truncate">{product.description || '-'}</TableCell>
                        <TableCell className="text-xs">{product.category || '-'}</TableCell>
                        <TableCell className="text-xs">{product.brand || '-'}</TableCell>
                        <TableCell className="text-sm font-medium text-gray-700">{formatPrice(product.supplierPrice)}</TableCell>
                        <TableCell className="text-sm font-semibold text-[#F27A1A]">{formatPrice(salePrice)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                            {product.stock > 0 ? 'Stokta' : 'Tükendi'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.isPublished ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Yayında
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Bekliyor
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.imageUrls ? (
                            (() => {
                              try {
                                const urls = JSON.parse(product.imageUrls)
                                return urls.length > 0 ? (
                                  <img
                                    src={urls[0]}
                                    alt={product.productName}
                                    className="w-10 h-10 object-cover rounded border"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                  />
                                ) : <span className="text-xs text-gray-400">Yok</span>
                              } catch { return <span className="text-xs text-gray-400">Yok</span> }
                            })()
                          ) : (
                            <span className="text-xs text-gray-400">Yok</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Toplam {totalProducts} ürün • Sayfa {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Önceki
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Scraping Progress */}
      {scraping && (
        <div className="fixed bottom-4 right-4 bg-[#1A2744] text-white rounded-xl px-6 py-4 shadow-2xl z-50 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#F27A1A]" />
          <div>
            <p className="font-semibold">Scraping Çalışıyor...</p>
            <p className="text-xs text-white/60">MOTOLUX bayi portalından ürünler çekiliyor</p>
          </div>
        </div>
      )}

      {/* Publishing Progress */}
      {publishing && (
        <div className="fixed bottom-4 right-4 bg-green-800 text-white rounded-xl px-6 py-4 shadow-2xl z-50 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div>
            <p className="font-semibold">Yayınlama Çalışıyor...</p>
            <p className="text-xs text-white/60">Ürünler marketplace vitrinine aktarılıyor</p>
          </div>
        </div>
      )}
    </div>
  )
}
