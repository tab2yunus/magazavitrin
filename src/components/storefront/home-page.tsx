'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  ShieldCheck,
  Truck,
  BadgeCheck,
  RotateCcw,
  Package,
  Cog,
  Disc3,
  Wrench,
  Zap,
  Bike,
  Gauge,
  Users,
  Store,
  Flame,
  Sparkles,
  Tag,
  CircleDot,
  Circle,
  Settings2,
} from 'lucide-react'
import ProductCard from './product-card'
import type { Product, Category, Store as StoreType, Brand, Banner, Campaign } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { proxyImageUrl } from '@/lib/storefront-utils'

/* ─── Brand Color Tokens ─── */
const C = {
  primary: '#F27A1A',
  primaryDark: '#D4630E',
  primaryLight: '#FFF3E8',
  secondary: '#0F1B2D',
  secondaryLight: '#1B2D45',
  surface: '#F4F5F7',
  text: '#0F1B2D',
  textSecondary: '#4A5568',
  textMuted: '#8C95A6',
  border: '#E2E5EA',
  success: '#10B981',
  danger: '#EF4444',
} as const

/* ─── Category icon mapping ─── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fren': <Disc3 className="h-6 w-6" />,
  'Motor': <Cog className="h-6 w-6" />,
  'Şanzıman': <Wrench className="h-6 w-6" />,
  'Elektrik': <Zap className="h-6 w-6" />,
  'Gövde': <Package className="h-6 w-6" />,
  'Süspansiyon': <Gauge className="h-6 w-6" />,
  'Kaporta': <Bike className="h-6 w-6" />,
  'Aydınlatma': <Sparkles className="h-6 w-6" />,
  'Egzoz': <Flame className="h-6 w-6" />,
  'Lastik': <Circle className="h-6 w-6" />,
  'Yağ': <CircleDot className="h-6 w-6" />,
  'Aksesuar': <Tag className="h-6 w-6" />,
}

function getCategoryIcon(cat: Category): React.ReactNode {
  if (cat.icon && CATEGORY_ICONS[cat.icon]) return CATEGORY_ICONS[cat.icon]
  // Fallback: use first letter based icon
  const nameMap: Record<string, React.ReactNode> = {
    'Fren': <Disc3 className="h-6 w-6" />,
    'Motor': <Settings2 className="h-6 w-6" />,
    'Şanzıman': <Wrench className="h-6 w-6" />,
    'Elektrik': <Zap className="h-6 w-6" />,
    'Süspansiyon': <Gauge className="h-6 w-6" />,
    'Kaporta': <Bike className="h-6 w-6" />,
    'Aydınlatma': <Sparkles className="h-6 w-6" />,
    'Egzoz': <Flame className="h-6 w-6" />,
    'Lastik': <Circle className="h-6 w-6" />,
    'Aksesuar': <Tag className="h-6 w-6" />,
  }
  if (nameMap[cat.name]) return nameMap[cat.name]
  return <Package className="h-6 w-6" />
}

/* ─── Marquee Brand Strip Component ─── */
function MarqueeStrip({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null
  // Duplicate the list for seamless looping
  const doubled = [...brands, ...brands]

  return (
    <div className="overflow-hidden relative w-full">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #F4F5F7, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #F4F5F7, transparent)' }} />

      <div className="flex animate-marquee">
        {doubled.map((brand, idx) => (
          <Link
            key={`${brand.id}-${idx}`}
            href={`/marka/${brand.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2 mx-2 rounded-lg whitespace-nowrap transition-colors hover:bg-white"
            style={{ color: C.textSecondary, minWidth: 'fit-content' }}
          >
            {brand.logo ? (
              <img
                src={proxyImageUrl(brand.logo)}
                alt={brand.name}
                className="h-6 w-6 object-contain rounded"
              />
            ) : (
              <span
                className="h-7 w-7 rounded flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: C.secondaryLight }}
              >
                {brand.name[0]}
              </span>
            )}
            <span className="text-sm font-medium">{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── Decorative Motorcycle SVG for Hero ─── */
function MotorcycleDecor() {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      className="absolute right-0 bottom-0 w-[320px] md:w-[420px] opacity-[0.07] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized motorcycle silhouette */}
      <circle cx="100" cy="160" r="40" stroke="white" strokeWidth="6" />
      <circle cx="300" cy="160" r="40" stroke="white" strokeWidth="6" />
      <circle cx="100" cy="160" r="12" stroke="white" strokeWidth="3" />
      <circle cx="300" cy="160" r="12" stroke="white" strokeWidth="3" />
      <path
        d="M140 160 L180 100 L220 80 L260 90 L280 130 L260 160"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 160 L80 130 L140 160"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M180 100 L200 60 L220 80"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M260 90 L290 70 L310 80"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="190" y="55" width="25" height="8" rx="2" stroke="white" strokeWidth="2" />
    </svg>
  )
}

/* ─── Main HomePage Component ─── */
export default function HomePage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [heroInView, setHeroInView] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bannersRes, campaignsRes, catRes, storeRes, bestRes, newRes, featRes, brandRes] = await Promise.all([
        fetch('/api/banners?active=true'),
        fetch('/api/campaigns?active=true'),
        fetch('/api/categories'),
        fetch('/api/stores'),
        fetch('/api/products?bestSeller=true&limit=8'),
        fetch('/api/products?new=true&limit=8'),
        fetch('/api/products?featured=true&limit=8'),
        fetch('/api/brands'),
      ])

      const [bannersData, campaignsData, catData, storeData, bestData, newData, featData, brandData] = await Promise.all([
        bannersRes.json(),
        campaignsRes.json(),
        catRes.json(),
        storeRes.json(),
        bestRes.json(),
        newRes.json(),
        featRes.json(),
        brandRes.json(),
      ])

      setBanners(Array.isArray(bannersData) ? bannersData.filter((b: Banner) => b.position === 'home_slider') : [])
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      setStores(Array.isArray(storeData) ? storeData : [])
      setBestSellers(bestData.products || [])
      setNewProducts(newData.products || [])
      setFeaturedProducts(featData.products || [])
      setBrands(Array.isArray(brandData) ? brandData : [])
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Trigger hero animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setHeroInView(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="space-y-0">
        {/* Hero skeleton */}
        <div className="w-full" style={{ backgroundColor: C.secondary }}>
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <Skeleton className="h-10 w-3/4 mb-4 bg-white/10" />
            <Skeleton className="h-6 w-1/2 mb-8 bg-white/10" />
            <Skeleton className="h-14 w-full max-w-2xl bg-white/10" />
          </div>
        </div>
        {/* Trust band skeleton */}
        <Skeleton className="w-full h-16" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasBanners = banners.length > 0

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full overflow-hidden" style={{ backgroundColor: C.secondary }}>
        {hasBanners ? (
          /* ── Hero Banner Slider ── */
          <div className="relative group">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="w-full shrink-0">
                  <div className="relative aspect-[2.5/1] sm:aspect-[3/1] md:aspect-[4/1]">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(15,27,45,0.7) 0%, rgba(15,27,45,0.3) 50%, transparent 100%)' }} />
                    <div className="absolute inset-0 flex items-center">
                      <div className="max-w-7xl mx-auto px-4 w-full">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in-up">
                          {banner.title}
                        </h2>
                        <Button
                          asChild
                          className="animate-fade-in-up stagger-2"
                          style={{ backgroundColor: C.primary, color: '#fff' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryDark)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
                        >
                          <Link href={banner.link || '/ara'}>Hemen İncele</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentSlide ? 'w-8' : 'w-3 bg-white/40'
                      }`}
                      style={i === currentSlide ? { backgroundColor: C.primary } : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── Static Hero with Gradient ── */
          <div className="relative min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden brand-gradient-hero">
            <MotorcycleDecor />

            {/* Decorative circles */}
            <div className="absolute top-10 right-20 w-64 h-64 rounded-full opacity-[0.04] border-2 border-white pointer-events-none" />
            <div className="absolute bottom-20 right-40 w-32 h-32 rounded-full opacity-[0.06] border border-white pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02] border border-white pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
              <div className="max-w-2xl">
                {/* Main heading */}
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-tight mb-4 transition-all duration-700 ${
                    heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  Türkiye&apos;nin En Büyük{' '}
                  <span className="brand-text-gradient">Motosiklet Yedek Parça</span>{' '}
                  Pazaryeri
                </h1>

                {/* Subheading */}
                <p
                  className={`text-base sm:text-lg text-white/70 mb-8 max-w-xl leading-relaxed transition-all duration-700 delay-150 ${
                    heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  Orijinal yedek parça, güvenli alışveriş ve hızlı kargo avantajıyla binlerce motosiklet parçasını tek panelde keşfedin.
                </p>

                {/* Search bar */}
                <form
                  onSubmit={handleSearch}
                  className={`flex items-center gap-2 max-w-2xl mb-8 transition-all duration-700 delay-300 ${
                    heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: C.textMuted }} />
                    <Input
                      type="text"
                      placeholder="OEM kodu, ürün adı, marka veya model ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-13 md:h-14 pl-12 pr-4 rounded-xl text-base border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-offset-0"
                      style={{ backgroundColor: '#fff', color: C.text, focusVisibleRingColor: C.primary }}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-13 md:h-14 px-6 md:px-8 rounded-xl text-base font-semibold shadow-lg transition-all duration-200 border-0"
                    style={{ backgroundColor: C.primary, color: '#fff' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryDark)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Parça Ara
                  </Button>
                </form>

                {/* CTA buttons */}
                <div
                  className={`flex flex-wrap gap-3 mb-10 transition-all duration-700 delay-[400ms] ${
                    heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl font-semibold px-6 border-0 shadow-md"
                    style={{ backgroundColor: C.primary, color: '#fff' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryDark)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
                  >
                    <Link href="/ara">
                      <Search className="h-4 w-4 mr-2" />
                      Parça Ara
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl font-semibold px-6 bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50 shadow-none"
                  >
                    <Link href="/ara?q=markalar">
                      Markaları Keşfet
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div
                  className={`flex flex-wrap gap-6 md:gap-10 transition-all duration-700 delay-500 ${
                    heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  {[
                    { value: '100.000+', label: 'Ürün' },
                    { value: '500+', label: 'Marka' },
                    { value: '1000+', label: 'Model' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <div className="h-8 w-1 rounded-full" style={{ backgroundColor: C.primary }} />
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: TRUST BAND
          ═══════════════════════════════════════════ */}
      <section style={{ backgroundColor: C.surface }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x" style={{ borderColor: C.border }}>
            {[
              { icon: <ShieldCheck className="h-5 w-5" style={{ color: C.primary }} />, text: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme' },
              { icon: <Truck className="h-5 w-5" style={{ color: C.primary }} />, text: 'Aynı Gün Kargo', desc: '15:00 önceki siparişler' },
              { icon: <BadgeCheck className="h-5 w-5" style={{ color: C.primary }} />, text: 'Orijinal Parça', desc: 'Garantili ürünler' },
              { icon: <RotateCcw className="h-5 w-5" style={{ color: C.primary }} />, text: 'Kolay İade', desc: '14 gün iade garantisi' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-4 px-4 md:px-6 group cursor-default transition-colors hover:bg-white/60"
                style={{ borderRightColor: i < 3 ? C.border : 'transparent' }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: C.primaryLight }}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: C.text }}>{item.text}</div>
                  <div className="text-xs truncate hidden sm:block" style={{ color: C.textMuted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: POPULER KATEGORILER
          ═══════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                  Popüler Kategoriler
                </h2>
                <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                  Aradığın parçayı kategoriye göre bul
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-semibold gap-1"
                style={{ color: C.primary }}
                asChild
              >
                <Link href="/ara">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className={`group relative flex items-center gap-4 p-4 md:p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up stagger-${i + 1}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: C.border,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.primary
                    e.currentTarget.style.backgroundColor = C.primaryLight
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: C.primaryLight, color: C.primary }}
                  >
                    {getCategoryIcon(cat)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: C.text }}>
                      {cat.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                      {cat._count?.products ?? 0} ürün
                    </p>
                  </div>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: C.primary }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  {/* Bottom "Parçaları Gör" link on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 text-center py-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 rounded-b-xl"
                    style={{ backgroundColor: C.primary, color: '#fff' }}
                  >
                    Parçaları Gör
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 4: MARKA DUVARI (Brand Wall)
          ═══════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: C.surface }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                  Marka Duvvarı
                </h2>
                <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                  Dünyanın önde gelen motosiklet markaları
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-semibold gap-1"
                style={{ color: C.primary }}
                asChild
              >
                <Link href="/ara?q=markalar">
                  Tüm Markalar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Brand card grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
              {brands.slice(0, 12).map((brand, i) => (
                <Link
                  key={brand.id}
                  href={`/marka/${brand.slug}`}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                  style={{ borderColor: C.border }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden transition-colors"
                    style={{ backgroundColor: C.surface }}
                  >
                    {brand.logo ? (
                      <img
                        src={proxyImageUrl(brand.logo)}
                        alt={brand.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span
                        className="text-lg font-bold"
                        style={{ color: C.secondaryLight }}
                      >
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium text-center truncate w-full"
                    style={{ color: C.text }}
                  >
                    {brand.name}
                  </span>
                  <span className="text-[10px]" style={{ color: C.textMuted }}>
                    {brand._count?.products ?? 0} ürün
                  </span>
                </Link>
              ))}
            </div>

            {/* Marquee scrolling brand strip */}
            {brands.length > 6 && <MarqueeStrip brands={brands} />}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 5: ÇOK SATANLAR (Best Sellers)
          ═══════════════════════════════════════════ */}
      {bestSellers.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                  <Flame className="h-5 w-5" style={{ color: C.primary }} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                    Çok Satanlar
                  </h2>
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    En çok tercih edilen ürünler
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-semibold gap-1"
                style={{ color: C.primary }}
                onClick={() => router.push('/ara?q=cok+satan')}
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 6: YENİ ÜRÜNLER (New Products)
          ═══════════════════════════════════════════ */}
      {newProducts.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: C.surface }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
                  <Sparkles className="h-5 w-5" style={{ color: C.success }} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                    Yeni Ürünler
                  </h2>
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    Yeni eklenen ürünleri kaçırmayın
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-semibold gap-1"
                style={{ color: C.primary }}
                onClick={() => router.push('/ara?q=yeni')}
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 7: İNDİRİMLİ ÜRÜNLER (Discounted)
          ═══════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <Tag className="h-5 w-5" style={{ color: C.danger }} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                    İndirimli Ürünler
                  </h2>
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    Fırsat ürünlerini yakalayın
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-semibold gap-1"
                style={{ color: C.primary }}
                onClick={() => router.push('/ara?q=indirim')}
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 8: ÖNE ÇIKAN MAĞAZALAR (Featured Stores)
          ═══════════════════════════════════════════ */}
      {stores.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: C.surface }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                  <Store className="h-5 w-5" style={{ color: C.primary }} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                    Öne Çıkan Mağazalar
                  </h2>
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    Güvenilir satıcılardan alışveriş yapın
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {stores.slice(0, 10).map((store) => (
                  <Link
                    key={store.id}
                    href={`/magaza/${store.slug}`}
                    className="inline-flex flex-col items-center gap-3 p-5 rounded-xl border bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 min-w-[170px] shrink-0 group"
                    style={{ borderColor: C.border }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-colors"
                      style={{ backgroundColor: C.primaryLight }}
                    >
                      {store.logo ? (
                        <img
                          src={proxyImageUrl(store.logo)}
                          alt={store.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xl font-bold" style={{ color: C.primary }}>
                          {store.name[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-sm block truncate max-w-[140px]" style={{ color: C.text }}>
                        {store.name}
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs" style={{ color: C.textMuted }}>
                        <span style={{ color: C.primary }}>★</span>
                        <span>{store.rating}</span>
                        <span>·</span>
                        <Users className="h-3 w-3" />
                        <span>{store.followerCount.toLocaleString('tr-TR')}</span>
                      </div>
                      {store.city && (
                        <span className="text-[10px] mt-0.5 block" style={{ color: C.textMuted }}>
                          📍 {store.city}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.primary }}>
                      Mağazaya Git
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 9: KAMPANYALAR (Campaigns)
          ═══════════════════════════════════════════ */}
      {campaigns.length > 0 && (
        <section className="py-10 md:py-14" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                  <Tag className="h-5 w-5" style={{ color: C.primary }} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.text }}>
                    Kampanyalar
                  </h2>
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    Sınırlı süreli fırsatları kaçırmayın
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign, i) => (
                <Link
                  key={campaign.id}
                  href={campaign.link || `/ara?q=${encodeURIComponent(campaign.title)}`}
                  className={`group relative rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                  style={{ borderColor: C.border }}
                >
                  {campaign.image ? (
                    <div className="relative">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,27,45,0.6) 0%, transparent 60%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-base mb-0.5">{campaign.title}</h3>
                        {campaign.discountText && (
                          <Badge
                            className="border-0 font-bold"
                            style={{ backgroundColor: C.primary, color: '#fff' }}
                          >
                            {campaign.discountText}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative h-44 flex items-center justify-center p-6"
                      style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)` }}
                    >
                      {/* Decorative circles */}
                      <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10 border border-white pointer-events-none" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-10 border border-white pointer-events-none" />

                      <div className="text-center relative z-10">
                        <h3 className="font-bold text-xl text-white mb-1">{campaign.title}</h3>
                        {campaign.discountText && (
                          <Badge className="border-0 font-bold text-sm bg-white/20 text-white hover:bg-white/30">
                            {campaign.discountText}
                          </Badge>
                        )}
                        {campaign.description && (
                          <p className="text-white/70 text-sm mt-2 line-clamp-2">{campaign.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          CTA BANNER - Bottom call to action
          ═══════════════════════════════════════════ */}
      <section className="py-12 md:py-16" style={{ backgroundColor: C.secondary }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-center" style={{ background: `linear-gradient(135deg, ${C.secondaryLight} 0%, ${C.secondary} 100%)` }}>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 border border-white pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-5 border border-white pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">
              Mağazanızı Açın, Binlerce Motosever&apos;e Ulaşın
            </h2>
            <p className="text-white/60 mb-6 max-w-lg mx-auto relative z-10">
              MağazaVitrin&apos;de mağazanızı açarak motosiklet yedek parça satışınıza başlayın. Düşük komisyon, güçlü altyapı.
            </p>
            <div className="flex flex-wrap justify-center gap-3 relative z-10">
              <Button
                size="lg"
                className="rounded-xl font-semibold px-8 border-0 shadow-lg"
                style={{ backgroundColor: C.primary, color: '#fff' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryDark)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
                asChild
              >
                <Link href="/kayit">Mağaza Aç</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl font-semibold px-8 bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50"
                asChild
              >
                <Link href="/ara">Ürünleri Keşfet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
