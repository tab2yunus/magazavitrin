'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown, Shield, Loader2, Tag, Building2, Package } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useFavoritesStore, useComparisonStore } from '@/stores/favorites-store'
import type { Category, Brand, Product } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice } from '@/lib/storefront-utils'

interface SearchSuggestion {
  products: (Product & { avgRating?: number; reviewCount?: number })[]
  categories: Category[]
  brands: Brand[]
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
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Live search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Live search with debounce
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
    // Clear previous debounce timer
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

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close suggestions on Escape
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

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-[#1A2744] text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>Ücretsiz kargo 200 TL üzeri siparişlerde!</span>
          <div className="hidden sm:flex items-center gap-4">
            <span>0850 123 45 67</span>
            <span>info@magazavitrin.com</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="p-4 border-b text-lg font-bold text-[#1A2744]">Kategoriler</SheetTitle>
              <ScrollArea className="h-[calc(100vh-60px)]">
                <div className="py-2">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/kategori/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FFF3E8] text-left text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        {cat.children && cat.children.length > 0 && (
                          <ChevronDown
                            className="h-4 w-4 transition-transform"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCategoryDropdown(categoryDropdown === cat.id ? null : cat.id)
                            }}
                          />
                        )}
                      </Link>
                      {cat.children && cat.children.length > 0 && categoryDropdown === cat.id && (
                        <div className="bg-gray-50">
                          {cat.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/kategori/${child.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="w-full flex items-center gap-2 px-8 py-2.5 hover:bg-[#FFF3E8] text-sm text-gray-600"
                            >
                              <span>{child.icon}</span>
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-2xl font-extrabold">
              <span className="text-[#F27A1A]">Mağaza</span>
              <span className="text-[#1A2744]">Vitrin</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 relative" ref={suggestionsRef}>
            <div className="relative w-full flex">
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
                placeholder="Parça, model veya marka ara..."
                className="w-full h-11 pl-4 pr-12 rounded-l-lg border-r-0 focus-visible:ring-[#F27A1A] border-gray-300"
              />
              <Button
                onClick={handleSearchClick}
                className="h-11 px-4 rounded-l-none bg-[#F27A1A] hover:bg-[#D4630E] text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] max-h-[420px] overflow-y-auto custom-scrollbar">
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#F27A1A]" />
                    <span className="ml-2 text-sm text-gray-500">Aranıyor...</span>
                  </div>
                ) : hasSuggestionResults ? (
                  <div className="py-2">
                    {/* Products */}
                    {suggestions!.products.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Ürünler
                        </div>
                        {suggestions!.products.map((product) => {
                          const imageUrl = product.images?.[0]?.url || `https://placehold.co/48x48/F5F5F5/999?text=${encodeURIComponent(product.name.slice(0, 2))}`
                          const currentPrice = product.discountPrice || product.normalPrice
                          const hasDiscount = product.discountPrice && product.discountPrice < product.normalPrice
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleSuggestionClick(`/urun/${product.slug}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF3E8] transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden shrink-0">
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
                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                <div className="flex items-center gap-2">
                                  {product.brand && (
                                    <span className="text-xs text-gray-500">{product.brand.name}</span>
                                  )}
                                  {product.category && (
                                    <span className="text-xs text-gray-400">• {product.category.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-sm font-bold ${hasDiscount ? 'text-[#F27A1A]' : 'text-[#1A2744]'}`}>
                                  {formatPrice(currentPrice)}
                                </span>
                                {hasDiscount && (
                                  <span className="block text-xs text-gray-400 line-through">
                                    {formatPrice(product.normalPrice)}
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Categories */}
                    {suggestions!.categories.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                          Kategoriler
                        </div>
                        {suggestions!.categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSuggestionClick(`/kategori/${cat.slug}`)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FFF3E8] transition-colors text-left"
                          >
                            <Tag className="h-4 w-4 text-[#F27A1A] shrink-0" />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Brands */}
                    {suggestions!.brands.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                          Markalar
                        </div>
                        {suggestions!.brands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => handleSuggestionClick(`/marka/${brand.slug}`)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FFF3E8] transition-colors text-left"
                          >
                            <Building2 className="h-4 w-4 text-[#1A2744] shrink-0" />
                            <span className="text-sm text-gray-700">{brand.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* See all results */}
                    <div className="border-t mt-1">
                      <button
                        onClick={() => {
                          setShowSuggestions(false)
                          router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`)
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#F27A1A] hover:bg-[#FFF3E8] transition-colors"
                      >
                        <Search className="h-4 w-4" />
                        Tüm sonuçları gör
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      &ldquo;{searchQuery}&rdquo; için sonuç bulunamadı
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Action icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {user && (user.role === 'super_admin' || user.role === 'editor') && (
              <Link
                href="/admin"
                title="Yönetim Paneli"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Shield className="h-5 w-5 text-[#F27A1A]" />
                </Button>
              </Link>
            )}

            <Link href="/favorilerim">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Heart className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>

            <Link href={user ? '/hesabim' : '/giris'}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>

            <Link href="/sepet">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-[#F27A1A] text-white border-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-3 flex">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Parça, model veya marka ara..."
              className="flex-1 h-10 rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-[#F27A1A]"
              autoFocus
            />
            <Button
              onClick={handleSearchClick}
              className="h-10 px-3 rounded-l-none bg-[#F27A1A] hover:bg-[#D4630E] text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Category navigation - Desktop */}
      <div className="hidden lg:block border-t bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1">
            {categories.map((cat) => (
              <div key={cat.id} className="relative group">
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F27A1A] whitespace-nowrap transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Link>
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg border border-gray-100 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/kategori/${child.slug}`}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-[#FFF3E8] hover:text-[#F27A1A] flex items-center gap-2"
                      >
                        <span>{child.icon}</span>
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
