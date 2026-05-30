'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Trash2, RefreshCw, Search, Database, Loader2, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react'
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

export default function ScraperTab() {
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [logs, setLogs] = useState<ScraperLog[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<any>(null)

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

  useEffect(() => {
    fetchProducts()
    fetchLogs()
  }, [fetchProducts, fetchLogs])

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

  async function handleDeleteAll() {
    if (!confirm('Tüm içe aktarılan ürünleri silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch('/api/scraper/products', { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
        fetchLogs()
      }
    } catch { /* ignore */ }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('tr-TR')
  }

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
          <p className="text-sm text-gray-500 mt-1">MOTOLUX bayi portalından ürün çekme</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleScrape(10)}
            disabled={scraping}
            variant="outline"
            className="border-[#F27A1A] text-[#F27A1A] hover:bg-[#FFF3E8]"
          >
            {scraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            10 Ürün Test
          </Button>
          <Button
            onClick={() => handleScrape(100)}
            disabled={scraping}
            variant="outline"
            className="border-[#F27A1A] text-[#F27A1A] hover:bg-[#FFF3E8]"
          >
            100 Ürün
          </Button>
          <Button
            onClick={() => handleScrape(1000)}
            disabled={scraping}
            className="bg-[#F27A1A] hover:bg-[#D4630E] text-white"
          >
            1000 Ürün
          </Button>
          <Button
            onClick={() => handleScrape(0)}
            disabled={scraping}
            className="bg-[#1A2744] hover:bg-[#0F1B33] text-white"
          >
            Tümünü Çek
          </Button>
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                  <p className="text-2xl font-bold text-blue-600">{scrapeResult.categories}</p>
                  <p className="text-xs text-gray-600">Kategori</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto text-[#F27A1A] mb-2" />
            <p className="text-2xl font-bold text-[#1A2744]">{totalProducts}</p>
            <p className="text-xs text-gray-500">İçe Aktarılan Ürün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-[#1A2744]">{categories.length}</p>
            <p className="text-xs text-gray-500">Kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.stock > 0).length}
            </p>
            <p className="text-xs text-gray-500">Stokta (bu sayfa)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </p>
            <p className="text-xs text-gray-500">Tükendi (bu sayfa)</p>
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
          <SelectTrigger className="w-full sm:w-64">
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
        <Button variant="outline" size="icon" onClick={() => { fetchProducts(); fetchLogs() }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Ürün Kodu</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#F27A1A]" />
                      <p className="text-sm text-gray-500 mt-2">Yükleniyor...</p>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      Henüz içe aktarılan ürün yok. Scraping işlemini başlatın.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, idx) => (
                    <TableRow key={product.id}>
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
                      <TableCell className="text-sm font-semibold text-[#F27A1A]">{formatPrice(product.supplierPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                          {product.stock > 0 ? 'Stokta' : 'Tükendi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.imageUrls && JSON.parse(product.imageUrls).length > 0 ? (
                          <img
                            src={JSON.parse(product.imageUrls)[0]}
                            alt={product.productName}
                            className="w-10 h-10 object-cover rounded border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Yok</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">{formatDate(product.createdAt)}</TableCell>
                    </TableRow>
                  ))
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
    </div>
  )
}
