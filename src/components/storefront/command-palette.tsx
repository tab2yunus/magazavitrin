'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Package,
  Tag,
  Building2,
  Store,
  ShoppingCart,
  Heart,
  User,
  Shield,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  LayoutDashboard,
  Settings2,
  Users,
  BarChart3,
  BoxIcon,
} from 'lucide-react'
import { useBrand } from '@/lib/brand-context'
import { useAuthStore } from '@/stores/auth-store'
import { formatPrice } from '@/lib/storefront-utils'
import type { Product, Category, Brand, Store as StoreType } from '@/types'

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

/* ─── Popular searches (hardcoded) ─── */
const POPULAR_SEARCHES = [
  'fren balatası',
  'yağ',
  'zincir',
  'egzoz',
  'lastik',
  'akü',
]

/* ─── Quick actions ─── */
const QUICK_ACTIONS = [
  { id: 'cart', label: 'Sepete Git', icon: ShoppingCart, href: '/sepet', shortcut: '' },
  { id: 'favorites', label: 'Favorilerim', icon: Heart, href: '/favorilerim', shortcut: '' },
  { id: 'account', label: 'Hesabım', icon: User, href: '/hesabim', shortcut: '' },
]

/* ─── Admin pages ─── */
const ADMIN_PAGES = [
  { id: 'admin-dashboard', label: 'Yönetim Paneli', icon: LayoutDashboard, href: '/admin' },
  { id: 'admin-products', label: 'Ürünler', icon: BoxIcon, href: '/admin?tab=products' },
  { id: 'admin-orders', label: 'Siparişler', icon: ShoppingCart, href: '/admin?tab=orders' },
  { id: 'admin-customers', label: 'Müşteriler', icon: Users, href: '/admin?tab=customers' },
  { id: 'admin-brands', label: 'Markalar', icon: Building2, href: '/admin?tab=brands' },
  { id: 'admin-categories', label: 'Kategoriler', icon: Tag, href: '/admin?tab=categories' },
  { id: 'admin-settings', label: 'Ayarlar', icon: Settings2, href: '/admin?tab=settings' },
  { id: 'admin-analytics', label: 'Analitik', icon: BarChart3, href: '/admin?tab=analytics' },
]

/* ─── Recent searches localStorage helpers ─── */
const RECENT_KEY = 'mv_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentSearches().filter(s => s !== query)
    recent.unshift(query)
    if (recent.length > MAX_RECENT) recent.pop()
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
  } catch { /* ignore */ }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentSearches().filter(s => s !== query)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
  } catch { /* ignore */ }
}

/* ─── Search result types ─── */
interface SearchResults {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  stores: StoreType[]
}

/* ═══════════════════════════════════════════════════
    CommandPalette Component
    ═══════════════════════════════════════════════════ */
export default function CommandPalette() {
  const router = useRouter()
  const { theme } = useBrand()
  const { user, isAdmin } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)



  /* ─── Keyboard shortcut: Ctrl+K / Cmd+K ─── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  /* ─── Load recent searches when dialog opens ─── */
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches())
      setQuery('')
      setResults(null)
    }
  }, [open])

  /* ─── Search with debounce ─── */
  const fetchSearchResults = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setResults({
          products: data.products?.slice(0, 8) || [],
          categories: data.categories?.slice(0, 5) || [],
          brands: data.brands?.slice(0, 5) || [],
          stores: data.stores?.slice(0, 5) || [],
        })
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSearchResults(query)
      }, 250)
    } else {
      setResults(null)
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchSearchResults])

  /* ─── Navigation handlers ─── */
  function handleSelect(callback: () => void) {
    setOpen(false)
    callback()
  }

  function handleSearchSelect(searchQuery: string) {
    addRecentSearch(searchQuery)
    setOpen(false)
    router.push(`/ara?q=${encodeURIComponent(searchQuery)}`)
  }

  function handleProductSelect(product: Product) {
    addRecentSearch(query)
    setOpen(false)
    router.push(`/urun/${product.slug}`)
  }

  function handleCategorySelect(category: Category) {
    setOpen(false)
    router.push(`/kategori/${category.slug}`)
  }

  function handleBrandSelect(brand: Brand) {
    setOpen(false)
    router.push(`/marka/${brand.slug}`)
  }

  function handleStoreSelect(store: StoreType) {
    setOpen(false)
    router.push(`/magaza/${store.slug}`)
  }

  /* ─── Check if there are search results ─── */
  const hasResults = results && (
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.brands.length > 0 ||
    results.stores.length > 0
  )

  /* ─── Show default view when no query or results ─── */
  const showDefault = query.trim().length < 2 || !hasResults

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Komut Paleti"
      description="Arama yapın veya bir işlem seçin"
      className="sm:max-w-[640px]"
    >
      <CommandInput
        placeholder="Parça, model veya marka ara..."
        value={query}
        onValueChange={setQuery}
      />

      <CommandList className="max-h-[420px]">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme.colorPrimary }} />
            <span className="text-sm" style={{ color: theme.colorTextMuted }}>Aranıyor...</span>
          </div>
        )}

        {/* No results for search query */}
        {!loading && query.trim().length >= 2 && !hasResults && (
          <CommandEmpty>
            <div className="py-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colorBorder }} />
              <p className="text-sm font-medium" style={{ color: theme.colorTextMuted }}>
                &ldquo;{query}&rdquo; için sonuç bulunamadı
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Search Results */}
        {!loading && hasResults && (
          <>
            {/* Products */}
            {results!.products.length > 0 && (
              <CommandGroup heading="Ürünler">
                {results!.products.map((product) => {
                  const currentPrice = product.discountPrice || product.normalPrice
                  const hasDiscount = product.discountPrice && product.discountPrice < product.normalPrice
                  const imageUrl = product.images?.[0]?.url || ''
                  return (
                    <CommandItem
                      key={`product-${product.id}`}
                      value={`product-${product.name}`}
                      onSelect={() => handleProductSelect(product)}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: theme.colorSurface }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <Package className="h-4 w-4" style={{ color: theme.colorTextMuted }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: theme.colorText }}>{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand && (
                            <span className="text-xs font-medium" style={{ color: theme.colorPrimary }}>{product.brand.name}</span>
                          )}
                          {product.category && (
                            <span className="text-xs" style={{ color: theme.colorTextMuted }}>• {product.category.name}</span>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold shrink-0"
                        style={{ color: hasDiscount ? theme.colorPrimary : theme.colorSecondary }}
                      >
                        {formatPrice(currentPrice)}
                      </span>
                    </CommandItem>
                  )
                })}
                {/* See all results */}
                <CommandItem
                  value={`search-all-${query}`}
                  onSelect={() => handleSearchSelect(query)}
                  className="justify-center gap-2 py-2.5 font-semibold"
                  style={{ color: theme.colorPrimary }}
                >
                  <Search className="h-4 w-4" />
                  Tüm sonuçları gör
                  <ArrowRight className="h-3.5 w-3.5" />
                </CommandItem>
              </CommandGroup>
            )}

            {/* Categories */}
            {results!.categories.length > 0 && (
              <CommandGroup heading="Kategoriler">
                {results!.categories.map((cat) => (
                  <CommandItem
                    key={`cat-${cat.id}`}
                    value={`category-${cat.name}`}
                    onSelect={() => handleCategorySelect(cat)}
                    className="flex items-center gap-3 py-2"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: theme.colorPrimaryLight }}
                    >
                      <Tag className="h-3.5 w-3.5" style={{ color: theme.colorPrimary }} />
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: theme.colorText }}>{cat.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: theme.colorTextMuted }} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Brands */}
            {results!.brands.length > 0 && (
              <CommandGroup heading="Markalar">
                {results!.brands.map((brand) => (
                  <CommandItem
                    key={`brand-${brand.id}`}
                    value={`brand-${brand.name}`}
                    onSelect={() => handleBrandSelect(brand)}
                    className="flex items-center gap-3 py-2"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: theme.colorSurface }}
                    >
                      <Building2 className="h-3.5 w-3.5" style={{ color: theme.colorSecondary }} />
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: theme.colorText }}>{brand.name}</span>
                    {brand._count?.products !== undefined && (
                      <span className="text-xs" style={{ color: theme.colorTextMuted }}>{brand._count.products} ürün</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: theme.colorTextMuted }} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Stores */}
            {results!.stores.length > 0 && (
              <CommandGroup heading="Mağazalar">
                {results!.stores.map((store) => (
                  <CommandItem
                    key={`store-${store.id}`}
                    value={`store-${store.name}`}
                    onSelect={() => handleStoreSelect(store)}
                    className="flex items-center gap-3 py-2"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: theme.colorSurface }}
                    >
                      <Store className="h-3.5 w-3.5" style={{ color: theme.colorSecondary }} />
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: theme.colorText }}>{store.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: theme.colorTextMuted }} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        {/* Default view: Recent searches, Popular, Quick Actions */}
        {!loading && showDefault && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <CommandGroup heading="Son Aramalar">
                {recentSearches.map((search) => (
                  <CommandItem
                    key={`recent-${search}`}
                    value={`recent-${search}`}
                    onSelect={() => handleSearchSelect(search)}
                    className="flex items-center gap-3 py-2"
                  >
                    <Clock className="h-4 w-4 shrink-0" style={{ color: theme.colorTextMuted }} />
                    <span className="text-sm flex-1" style={{ color: theme.colorText }}>{search}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(search)
                        setRecentSearches(getRecentSearches())
                      }}
                      className="shrink-0 text-xs px-1.5 py-0.5 rounded transition-colors hover:bg-red-50"
                      style={{ color: theme.colorTextMuted }}
                    >
                      ✕
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Popular Searches */}
            <CommandGroup heading="Popüler Aramalar">
              {POPULAR_SEARCHES.map((search) => (
                <CommandItem
                  key={`popular-${search}`}
                  value={`popular-${search}`}
                  onSelect={() => handleSearchSelect(search)}
                  className="flex items-center gap-3 py-2"
                >
                  <TrendingUp className="h-4 w-4 shrink-0" style={{ color: theme.colorPrimary }} />
                  <span className="text-sm flex-1" style={{ color: theme.colorText }}>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Quick Actions */}
            <CommandGroup heading="Hızlı İşlemler">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={action.id}
                    value={`action-${action.id}`}
                    onSelect={() => handleSelect(() => router.push(action.href))}
                    className="flex items-center gap-3 py-2"
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: theme.colorPrimary }} />
                    <span className="text-sm flex-1" style={{ color: theme.colorText }}>{action.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {/* Admin Navigation (only for admin users) */}
            {isAdmin() && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Yönetim">
                  {ADMIN_PAGES.map((page) => {
                    const Icon = page.icon
                    return (
                      <CommandItem
                        key={page.id}
                        value={`admin-${page.id}`}
                        onSelect={() => handleSelect(() => router.push(page.href))}
                        className="flex items-center gap-3 py-2"
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: theme.colorSecondary }} />
                        <span className="text-sm flex-1" style={{ color: theme.colorText }}>{page.label}</span>
                        <CommandShortcut>
                          <Shield className="h-3 w-3" style={{ color: theme.colorTextMuted }} />
                        </CommandShortcut>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>

      {/* Footer hint */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: theme.colorBorder, color: theme.colorTextMuted }}
      >
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: theme.colorSurface, border: `1px solid ${theme.colorBorder}` }}
            >
              ↵
            </kbd>
            Seç
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: theme.colorSurface, border: `1px solid ${theme.colorBorder}` }}
            >
              ↑↓
            </kbd>
            Gezin
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: theme.colorSurface, border: `1px solid ${theme.colorBorder}` }}
            >
              esc
            </kbd>
            Kapat
          </span>
        </div>
        <span className="text-[10px] font-medium" style={{ color: theme.colorTextMuted }}>
          {theme.brandName}
        </span>
      </div>
    </CommandDialog>
  )
}
