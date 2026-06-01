'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, Heart, User, ShoppingCart, Menu, X, ChevronDown, ChevronRight,
  Shield, Loader2, Tag, Building2, Package, Phone, Mail, Truck,
  Flame, Wrench, CircleDot, Settings2, Zap, ArrowRight
} from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useFavoritesStore, useComparisonStore } from '@/stores/favorites-store'
import type { Category, Brand, Product } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/storefront-utils'

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

interface SearchSuggestion {
  products: (Product & { avgRating?: number; reviewCount?: number })[]
  categories: Category[]
  brands: Brand[]
}

/* ─── Motorcycle-themed category icons map ─── */
function getCategoryIcon(icon: string | null) {
  if (!icon) return <CircleDot className="h-4 w-4" style={{ color: C.primary }} />
  const emoji = icon.trim()
  if (emoji.startsWith('🔩') || emoji.startsWith('🔧')) return <Wrench className="h-4 w-4" style={{ color: C.primary }} />
  if (emoji.startsWith('⚡') || emoji.startsWith('🔋')) return <Zap className="h-4 w-4" style={{ color: C.primary }} />
  if (emoji.startsWith('🏷') || emoji.startsWith('💰')) return <Tag className="h-4 w-4" style={{ color: C.primary }} />
  if (emoji.startsWith('🔥') || emoji.startsWith('🏍')) return <Flame className="h-4 w-4" style={{ color: C.primary }} />
  if (emoji.startsWith('⚙') || emoji.startsWith('🛠')) return <Settings2 className="h-4 w-4" style={{ color: C.primary }} />
  // Fallback: render the original icon string (could be emoji)
  return <span className="text-base leading-none">{emoji}</span>
}

export default function StorefrontHeader() {
  const router = useRouter()
  const { items, fetchCart } = useCartStore()
  const { user, fetchUser } = useAuthStore()
  const { fetchFavorites } = useFavoritesStore()
  const { fetchComparisons } = useComparisonStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [categoryDropdown, setCategoryDropdown] = useState<string | null>(null)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ─── Scroll detection for sticky effects ─── */
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ─── Load initial data ─── */
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch { /* ignore */ }
    }
    loadInitialData()
    fetchUser()
    fetchCart()
  }, [fetchUser, fetchCart])

  useEffect(() => {
    if (user) {
      fetchFavorites()
      fetchComparisons()
    }
  }, [user, fetchFavorites, fetchComparisons])

  /* ─── Live search with debounce ─── */
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions(null)
      setShowSuggestions(false)
      return
    }
    setSuggestionsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions({
          products: data.products?.slice(0, 5) || [],
          categories: data.categories?.slice(0, 4) || [],
          brands: data.brands?.slice(0, 4) || [],
        })
        setShowSuggestions(true)
      }
    } catch { /* ignore */ }
    finally {
      setSuggestionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery)
      }, 300)
    } else {
      setSuggestions(null)
      setShowSuggestions(false)
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery, fetchSuggestions])

  /* ─── Close suggestions on outside click ─── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ─── Close suggestions on Escape ─── */
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  /* ─── Close mobile search on route change ─── */
  useEffect(() => {
    setMobileSearchOpen(false)
  }, [router])

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.normalPrice || 0
    return sum + price * item.quantity
  }, 0)

  const hasSuggestionResults = suggestions && (
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0
  )

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  function handleSearchClick() {
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  function handleSuggestionClick(href: string) {
    setShowSuggestions(false)
    setSearchQuery('')
    router.push(href)
  }

  /* ─── Mega menu hover handlers ─── */
  function handleMegaMenuEnter(catId: string) {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current)
      megaMenuTimeoutRef.current = null
    }
    setActiveMegaMenu(catId)
  }

  function handleMegaMenuLeave() {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 150)
  }

  /* ─── Top bar categories (first 2 levels for mega menu) ─── */
  const topLevelCategories = categories.filter(c => !c.parentId)

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        transition: 'box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.3s ease',
      }}
    >
      {/* ═══════════════════════════════════════════
          TOP BAR — Navy background, contact + promo
          ═══════════════════════════════════════════ */}
      <div
        className="hidden md:block text-xs py-1.5"
        style={{ background: C.secondary, color: 'rgba(255,255,255,0.85)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" style={{ color: C.primary }} />
              <span>200 TL üzeri siparişlerde <strong className="text-white">ücretsiz kargo</strong></span>
            </div>
            <Separator orientation="vertical" className="h-3.5 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" style={{ color: C.primary }} />
              <span>Aynı gün kargo imkânı</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <a href="tel:08501234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" />
              <span>0850 123 45 67</span>
            </a>
            <Separator orientation="vertical" className="h-3.5 bg-white/10" />
            <a href="mailto:info@magazavitrin.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="h-3 w-3" />
              <span>info@magazavitrin.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MAIN HEADER — Logo + Search + Actions
          ═══════════════════════════════════════════ */}
      <div
        className="transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.92)' : '#FFFFFF',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          boxShadow: scrolled
            ? '0 1px 3px rgba(15,27,45,0.06), 0 4px 16px rgba(15,27,45,0.04)'
            : '0 1px 2px rgba(15,27,45,0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 sm:gap-5">
            {/* ── Mobile Menu Toggle ── */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button
                  className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: C.primaryLight }}
                  aria-label="Menüyü aç"
                >
                  <Menu className="h-5 w-5" style={{ color: C.primary }} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 border-0" style={{ background: '#FFFFFF' }}>
                {/* Mobile Menu Header */}
                <div
                  className="p-5 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${C.secondary} 0%, ${C.secondaryLight} 100%)` }}
                >
                  <SheetTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="h-5 w-5" style={{ color: C.primary }} />
                    Kategoriler
                  </SheetTitle>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Kapat"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>

                {/* Mobile User Info */}
                {user && (
                  <div className="px-5 py-3 flex items-center gap-3" style={{ background: C.primaryLight }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: C.primary }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: C.text }}>{user.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{user.email}</p>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[calc(100vh-120px)]">
                  <div className="py-1">
                    {topLevelCategories.map((cat, idx) => (
                      <div key={cat.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                        <button
                          onClick={() => setCategoryDropdown(categoryDropdown === cat.id ? null : cat.id)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-all duration-200 hover:pl-6"
                          style={{ color: C.text }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryLight)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg text-sm" style={{ background: C.primaryLight }}>
                              {getCategoryIcon(cat.icon)}
                            </span>
                            <span className="text-sm font-medium">{cat.name}</span>
                          </span>
                          {cat.children && cat.children.length > 0 && (
                            <ChevronDown
                              className="h-4 w-4 transition-transform duration-200"
                              style={{ color: C.textMuted, transform: categoryDropdown === cat.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                          )}
                        </button>
                        {cat.children && cat.children.length > 0 && categoryDropdown === cat.id && (
                          <div className="animate-fade-in-up" style={{ background: C.surface }}>
                            {cat.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/kategori/${child.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-5 pl-16 py-3 text-sm transition-all duration-200 hover:pl-[4.25rem]"
                                style={{ color: C.textSecondary }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSecondary }}
                              >
                                <ChevronRight className="h-3 w-3" style={{ color: C.textMuted }} />
                                <span>{child.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {idx < topLevelCategories.length - 1 && (
                          <div className="mx-5" style={{ borderBottom: `1px solid ${C.border}` }} />
                        )}
                      </div>
                    ))}

                    {/* Mobile Menu Footer Links */}
                    <div className="mt-4 pt-4 px-5" style={{ borderTop: `1px solid ${C.border}` }}>
                      <Link
                        href="/favorilerim"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-3 text-sm font-medium"
                        style={{ color: C.textSecondary }}
                      >
                        <Heart className="h-4 w-4" style={{ color: C.primary }} />
                        Favorilerim
                      </Link>
                      <Link
                        href={user ? '/hesabim' : '/giris'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-3 text-sm font-medium"
                        style={{ color: C.textSecondary }}
                      >
                        <User className="h-4 w-4" style={{ color: C.primary }} />
                        {user ? 'Hesabım' : 'Giriş Yap'}
                      </Link>
                      {user && (user.role === 'super_admin' || user.role === 'editor') && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-3 text-sm font-medium"
                          style={{ color: C.textSecondary }}
                        >
                          <Shield className="h-4 w-4" style={{ color: C.primary }} />
                          Yönetim Paneli
                        </Link>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* ── Logo ── */}
            <Link href="/" className="shrink-0 flex items-center gap-2 group">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]"
                style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)` }}
              >
                <Wrench className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold leading-none tracking-tight">
                  <span style={{ color: C.primary }}>Mağaza</span>
                  <span style={{ color: C.secondary }}>Vitrin</span>
                </span>
                <span className="hidden sm:block text-[10px] font-medium tracking-wider uppercase leading-none mt-0.5" style={{ color: C.textMuted }}>
                  Motosiklet Yedek Parça
                </span>
              </div>
            </Link>

            {/* ── Desktop Search Bar (THE CENTERPIECE) ── */}
            <div className="hidden md:flex flex-1 max-w-2xl lg:max-w-3xl mx-2 lg:mx-6 relative" ref={suggestionsRef}>
              <div
                className="relative w-full flex rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: showSuggestions
                    ? `0 0 0 2px ${C.primary}, 0 8px 24px rgba(242,122,26,0.12)`
                    : `0 1px 3px rgba(15,27,45,0.06), 0 0 0 1px ${C.border}`,
                }}
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                    style={{ color: C.textMuted }}
                  />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2 && hasSuggestionResults) {
                        setShowSuggestions(true)
                      }
                    }}
                    placeholder="Parça, model veya marka ara...  örn: Honda CBR fren balatası"
                    className="w-full h-12 pl-11 pr-4 rounded-l-xl rounded-r-none border-0 text-sm font-medium focus-visible:ring-0 focus-visible:outline-none"
                    style={{ background: '#FFFFFF', color: C.text }}
                  />
                </div>
                <button
                  onClick={handleSearchClick}
                  className="h-12 px-6 rounded-r-xl flex items-center justify-center gap-2 text-white font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] shrink-0"
                  style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)` }}
                >
                  <Search className="h-4.5 w-4.5" />
                  <span className="hidden lg:inline">Ara</span>
                </button>
              </div>

              {/* ── Search Suggestions Dropdown ── */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl z-[60] max-h-[480px] overflow-y-auto custom-scrollbar animate-fade-in-up"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 12px 40px rgba(15,27,45,0.12), 0 0 0 1px rgba(226,229,234,0.5)',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.primary }} />
                      <span className="ml-3 text-sm font-medium" style={{ color: C.textMuted }}>Aranıyor...</span>
                    </div>
                  ) : hasSuggestionResults ? (
                    <div className="py-1">
                      {/* Products Section */}
                      {suggestions!.products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" style={{ color: C.primary }} />
                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Ürünler</span>
                          </div>
                          {suggestions!.products.map((product) => {
                            const imageUrl = product.images?.[0]?.url || `https://placehold.co/48x48/F5F5F5/999?text=${encodeURIComponent(product.name.slice(0, 2))}`
                            const currentPrice = product.discountPrice || product.normalPrice
                            const hasDiscount = product.discountPrice && product.discountPrice < product.normalPrice
                            return (
                              <button
                                key={product.id}
                                onClick={() => handleSuggestionClick(`/urun/${product.slug}`)}
                                className="w-full flex items-center gap-3.5 px-4 py-3 transition-all duration-200 text-left group/hover"
                                onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <div
                                  className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
                                  style={{ background: C.surface }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://placehold.co/48x48/F5F5F5/999?text=${encodeURIComponent(product.name.slice(0, 2))}`
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{product.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {product.brand && (
                                      <span className="text-xs font-medium" style={{ color: C.primary }}>{product.brand.name}</span>
                                    )}
                                    {product.category && (
                                      <span className="text-xs" style={{ color: C.textMuted }}>• {product.category.name}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: hasDiscount ? C.primary : C.secondary }}
                                  >
                                    {formatPrice(currentPrice)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="block text-xs line-through" style={{ color: C.textMuted }}>
                                      {formatPrice(product.normalPrice)}
                                    </span>
                                  )}
                                </div>
                                <ArrowRight
                                  className="h-4 w-4 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover/hover:opacity-100 group-hover/hover:translate-x-0"
                                  style={{ color: C.primary }}
                                />
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Categories Section */}
                      {suggestions!.categories.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center gap-2 mt-1" style={{ borderTop: `1px solid ${C.border}` }}>
                            <Tag className="h-3.5 w-3.5" style={{ color: C.primary }} />
                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Kategoriler</span>
                          </div>
                          {suggestions!.categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleSuggestionClick(`/kategori/${cat.slug}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 text-left group/cat"
                              onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: C.primaryLight }}
                              >
                                {getCategoryIcon(cat.icon)}
                              </div>
                              <span className="text-sm font-medium" style={{ color: C.text }}>{cat.name}</span>
                              <ArrowRight
                                className="h-3.5 w-3.5 ml-auto opacity-0 -translate-x-1 transition-all duration-200 group/cat:opacity-100 group/cat:translate-x-0"
                                style={{ color: C.primary }}
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Brands Section */}
                      {suggestions!.brands.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center gap-2 mt-1" style={{ borderTop: `1px solid ${C.border}` }}>
                            <Building2 className="h-3.5 w-3.5" style={{ color: C.secondary }} />
                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Markalar</span>
                          </div>
                          {suggestions!.brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleSuggestionClick(`/marka/${brand.slug}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 text-left group/brand"
                              onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: C.surface }}
                              >
                                <Building2 className="h-4 w-4" style={{ color: C.secondary }} />
                              </div>
                              <span className="text-sm font-medium" style={{ color: C.text }}>{brand.name}</span>
                              {brand._count?.products !== undefined && (
                                <span className="text-xs ml-auto" style={{ color: C.textMuted }}>{brand._count.products} ürün</span>
                              )}
                              <ArrowRight
                                className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-200 group/brand:opacity-100 group/brand:translate-x-0"
                                style={{ color: C.primary }}
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* See All Results */}
                      <div style={{ borderTop: `1px solid ${C.border}` }} className="mt-1">
                        <button
                          onClick={() => {
                            setShowSuggestions(false)
                            router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold transition-all duration-200"
                          style={{ color: C.primary }}
                          onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Search className="h-4 w-4" />
                          Tüm sonuçları gör
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Package className="h-10 w-10 mx-auto mb-3" style={{ color: C.border }} />
                      <p className="text-sm font-medium" style={{ color: C.textMuted }}>
                        &ldquo;{searchQuery}&rdquo; için sonuç bulunamadı
                      </p>
                      <p className="text-xs mt-1" style={{ color: C.textMuted }}>Farklı anahtar kelimeler deneyin</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile Search Toggle ── */}
            <button
              className="md:hidden shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: C.primaryLight }}
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Ara"
            >
              <Search className="h-5 w-5" style={{ color: C.primary }} />
            </button>

            {/* ── Action Icons ── */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Admin */}
              {user && (user.role === 'super_admin' || user.role === 'editor') && (
                <Link href="/admin" title="Yönetim Paneli">
                  <button
                    className="relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Shield className="h-5 w-5" style={{ color: C.primary }} />
                  </button>
                </Link>
              )}

              {/* Favorites */}
              <Link href="/favorilerim" title="Favorilerim">
                <button
                  className="relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Heart className="h-5 w-5" style={{ color: C.textSecondary }} />
                </button>
              </Link>

              {/* Account */}
              <Link href={user ? '/hesabim' : '/giris'} title={user ? 'Hesabım' : 'Giriş Yap'}>
                <button
                  className="relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" style={{ color: C.textSecondary }} />
                  )}
                </button>
              </Link>

              {/* Cart */}
              <Link href="/sepet" title="Sepetim">
                <button
                  className="relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ShoppingCart className="h-5 w-5" style={{ color: C.textSecondary }} />
                  {cartItemCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 animate-scale-in"
                      style={{ background: C.danger }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Cart Total (Desktop) */}
              {cartItemCount > 0 && (
                <div className="hidden lg:flex flex-col items-start ml-1">
                  <span className="text-[10px] font-medium leading-none" style={{ color: C.textMuted }}>Sepet</span>
                  <span className="text-xs font-bold leading-tight" style={{ color: C.primary }}>{formatPrice(cartTotal)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE SEARCH OVERLAY
          ═══════════════════════════════════════════ */}
      {mobileSearchOpen && (
        <div
          className="md:hidden animate-fade-in-up"
          style={{ background: '#FFFFFF', borderTop: `1px solid ${C.border}` }}
        >
          <div className="px-4 py-3">
            <div className="flex rounded-xl overflow-hidden" style={{ boxShadow: `0 0 0 1px ${C.border}` }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Parça, model veya marka ara..."
                className="flex-1 h-11 pl-4 pr-3 rounded-l-xl rounded-r-none border-0 text-sm font-medium focus-visible:ring-0 focus-visible:outline-none"
                style={{ background: C.surface, color: C.text }}
                autoFocus
              />
              <button
                onClick={handleSearchClick}
                className="h-11 px-4 rounded-r-xl flex items-center justify-center text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] shrink-0"
                style={{ background: C.primary }}
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile search suggestions inline */}
            {showSuggestions && searchQuery.trim().length >= 2 && hasSuggestionResults && (
              <div
                className="mt-2 rounded-xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar animate-fade-in-up"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                {suggestions!.products.slice(0, 3).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(`/urun/${product.slug}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: '#FFFFFF' }}>
                      <img
                        src={product.images?.[0]?.url || `https://placehold.co/40x40/F5F5F5/999?text=${encodeURIComponent(product.name.slice(0, 2))}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: C.text }}>{product.name}</p>
                      <span className="text-xs font-bold" style={{ color: C.primary }}>
                        {formatPrice(product.discountPrice || product.normalPrice)}
                      </span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowSuggestions(false)
                    router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
                    setMobileSearchOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors"
                  style={{ color: C.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Search className="h-3.5 w-3.5" />
                  Tüm sonuçları gör
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          DESKTOP CATEGORY NAVIGATION BAR
          ═══════════════════════════════════════════ */}
      <div
        className="hidden lg:block transition-all duration-300"
        style={{
          background: C.secondary,
          boxShadow: scrolled ? '0 2px 8px rgba(15,27,45,0.15)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center">
            {/* All Categories Button */}
            <div className="relative">
              <button
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-white transition-all duration-200"
                style={{ background: C.primary }}
                onMouseEnter={() => handleMegaMenuEnter('__all__')}
                onMouseLeave={handleMegaMenuLeave}
              >
                <Menu className="h-4 w-4" />
                Tüm Kategoriler
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </button>

              {/* Mega Menu Dropdown - All Categories */}
              {activeMegaMenu === '__all__' && (
                <div
                  className="absolute top-full left-0 w-[600px] z-[55] animate-fade-in-up"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 16px 48px rgba(15,27,45,0.15), 0 0 0 1px rgba(226,229,234,0.5)',
                    borderRadius: '0 0 12px 12px',
                  }}
                  onMouseEnter={() => handleMegaMenuEnter('__all__')}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <div className="grid grid-cols-2 gap-0 p-4">
                    {topLevelCategories.map((cat) => (
                      <div key={cat.id} className="py-1">
                        <Link
                          href={`/kategori/${cat.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group/cat"
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryLight }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <span className="flex items-center justify-center w-7 h-7 rounded-md text-xs shrink-0" style={{ background: C.primaryLight }}>
                            {getCategoryIcon(cat.icon)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold block" style={{ color: C.text }}>{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <span className="text-[11px] block truncate" style={{ color: C.textMuted }}>
                                {cat.children.slice(0, 3).map(c => c.name).join(', ')}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 group/cat:opacity-100 group/cat:translate-x-0" style={{ color: C.primary }} />
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <Link
                      href="/ara?q="
                      className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200"
                      style={{ color: C.primary, background: C.primaryLight }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FFECD8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = C.primaryLight}
                    >
                      Tüm kategorilere göz at
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-0.5 overflow-x-auto custom-scrollbar ml-1">
              {topLevelCategories.slice(0, 8).map((cat) => (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => handleMegaMenuEnter(cat.id)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition-all duration-200 group/cnav"
                    style={{ color: activeMegaMenu === cat.id ? '#FFFFFF' : 'rgba(255,255,255,0.8)', background: activeMegaMenu === cat.id ? C.secondaryLight : 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = C.secondaryLight }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.name}</span>
                    {cat.children && cat.children.length > 0 && (
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    )}
                  </Link>

                  {/* Individual Category Hover Dropdown */}
                  {cat.children && cat.children.length > 0 && activeMegaMenu === cat.id && (
                    <div
                      className="absolute top-full left-0 min-w-[260px] z-[55] animate-fade-in-up"
                      style={{
                        background: '#FFFFFF',
                        boxShadow: '0 12px 32px rgba(15,27,45,0.12), 0 0 0 1px rgba(226,229,234,0.5)',
                        borderRadius: '0 0 12px 12px',
                      }}
                    >
                      <div className="py-2">
                        <div className="px-4 py-1.5 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: C.primaryLight }}>
                            {getCategoryIcon(cat.icon)}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.primary }}>
                            {cat.name}
                          </span>
                        </div>
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/kategori/${child.slug}`}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-200 group/child"
                            style={{ color: C.textSecondary }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSecondary }}
                          >
                            <span className="text-xs">{child.icon}</span>
                            <span className="font-medium">{child.name}</span>
                            {child._count?.products !== undefined && (
                              <span className="text-[11px] ml-auto font-medium" style={{ color: C.textMuted }}>
                                {child._count.products}
                              </span>
                            )}
                            <ArrowRight className="h-3 w-3 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 group/child:opacity-100 group/child:translate-x-0" style={{ color: C.primary }} />
                          </Link>
                        ))}
                        <div className="px-4 pt-2 mt-1" style={{ borderTop: `1px solid ${C.border}` }}>
                          <Link
                            href={`/kategori/${cat.slug}`}
                            className="flex items-center gap-1.5 text-xs font-bold transition-colors group/all"
                            style={{ color: C.primary }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            Tümünü gör
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side promo */}
            <div className="ml-auto flex items-center gap-2 pl-4 shrink-0">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(242,122,26,0.15)', color: C.primary }}
              >
                <Zap className="h-3 w-3" />
                Flash İndirim
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM BAR (for mobile sticky nav)
          ═══════════════════════════════════════════ */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass"
        style={{
          borderTop: `1px solid ${C.border}`,
          boxShadow: '0 -2px 10px rgba(15,27,45,0.06)',
        }}
      >
        <div className="flex items-center justify-around py-2 px-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors">
            <Search className="h-5 w-5" style={{ color: C.textMuted }} />
            <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>Keşfet</span>
          </Link>
          <Link href="/favorilerim" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative">
            <Heart className="h-5 w-5" style={{ color: C.textMuted }} />
            <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>Favori</span>
          </Link>
          <Link
            href="/sepet"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" style={{ color: C.primary }} />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5"
                  style={{ background: C.danger }}
                >
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold" style={{ color: C.primary }}>Sepet</span>
          </Link>
          <Link href={user ? '/hesabim' : '/giris'} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors">
            <User className="h-5 w-5" style={{ color: C.textMuted }} />
            <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>Hesap</span>
          </Link>
        </div>
        {/* Safe area spacer for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </header>
  )
}
