'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react'
import { useRouterStore } from '@/stores/router-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useFavoritesStore } from '@/stores/favorites-store'
import type { Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function StorefrontHeader() {
  const { route, navigate, goHome } = useRouterStore()
  const { items, fetchCart } = useCartStore()
  const { user, fetchUser } = useAuthStore()
  const { fetchFavorites } = useFavoritesStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [categoryDropdown, setCategoryDropdown] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
  }, [])

  useEffect(() => {
    if (user) fetchFavorites()
  }, [user])

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate({ page: 'search', q: searchQuery.trim() })
      setMobileSearchOpen(false)
    }
  }

  function handleSearchClick() {
    if (searchQuery.trim()) {
      navigate({ page: 'search', q: searchQuery.trim() })
      setMobileSearchOpen(false)
    }
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
                      <button
                        onClick={() => {
                          navigate({ page: 'category', slug: cat.slug })
                          setMobileMenuOpen(false)
                        }}
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
                              e.stopPropagation()
                              setCategoryDropdown(categoryDropdown === cat.id ? null : cat.id)
                            }}
                          />
                        )}
                      </button>
                      {cat.children && cat.children.length > 0 && categoryDropdown === cat.id && (
                        <div className="bg-gray-50">
                          {cat.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => {
                                navigate({ page: 'category', slug: child.slug })
                                setMobileMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-8 py-2.5 hover:bg-[#FFF3E8] text-sm text-gray-600"
                            >
                              <span>{child.icon}</span>
                              <span>{child.name}</span>
                            </button>
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
          <button onClick={goHome} className="shrink-0 flex items-center gap-1">
            <span className="text-2xl font-extrabold">
              <span className="text-[#F27A1A]">Mağaza</span>
              <span className="text-[#1A2744]">Vitrin</span>
            </span>
          </button>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full flex">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full h-11 pl-4 pr-12 rounded-l-lg border-r-0 focus-visible:ring-[#F27A1A] border-gray-300"
              />
              <Button
                onClick={handleSearchClick}
                className="h-11 px-4 rounded-l-none bg-[#F27A1A] hover:bg-[#D4630E] text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
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
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ page: 'favorites' })}
            >
              <Heart className="h-5 w-5 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => user ? navigate({ page: 'account' }) : navigate({ page: 'login' })}
            >
              <User className="h-5 w-5 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ page: 'cart' })}
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-[#F27A1A] text-white border-0">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-3 flex">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Ürün ara..."
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
                <button
                  onClick={() => navigate({ page: 'category', slug: cat.slug })}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F27A1A] whitespace-nowrap transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg border border-gray-100 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {cat.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate({ page: 'category', slug: child.slug })}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-[#FFF3E8] hover:text-[#F27A1A] flex items-center gap-2"
                      >
                        <span>{child.icon}</span>
                        <span>{child.name}</span>
                      </button>
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
