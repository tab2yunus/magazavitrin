'use client'

import { useEffect, useState } from 'react'
import { useRouterStore } from '@/stores/router-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import StorefrontHeader from '@/components/storefront/storefront-header'
import StorefrontFooter from '@/components/storefront/storefront-footer'
import HomePage from '@/components/storefront/home-page'
import ProductDetailPage from '@/components/storefront/product-detail-page'
import CategoryPage from '@/components/storefront/category-page'
import BrandPage from '@/components/storefront/brand-page'
import StorePage from '@/components/storefront/store-page'
import CartPage from '@/components/storefront/cart-page'
import CheckoutPage from '@/components/storefront/checkout-page'
import SearchPage from '@/components/storefront/search-page'
import LoginPage from '@/components/storefront/login-page'
import RegisterPage from '@/components/storefront/register-page'
import AccountPage from '@/components/storefront/account-page'
import OrdersPage from '@/components/storefront/orders-page'
import OrderDetailPage from '@/components/storefront/order-detail-page'
import FavoritesPage from '@/components/storefront/favorites-page'
import ComparisonsPage from '@/components/storefront/comparisons-page'
import OrderSuccessPage from '@/components/storefront/order-success-page'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { Database, Loader2 } from 'lucide-react'

function PageRouter() {
  const { route } = useRouterStore()

  switch (route.page) {
    case 'home':
      return <HomePage />
    case 'product':
      return <ProductDetailPage slug={route.slug} />
    case 'category':
      return <CategoryPage slug={route.slug} />
    case 'brand':
      return <BrandPage slug={route.slug} />
    case 'store':
      return <StorePage slug={route.slug} />
    case 'cart':
      return <CartPage />
    case 'checkout':
      return <CheckoutPage />
    case 'search':
      return <SearchPage query={route.q} />
    case 'login':
      return <LoginPage />
    case 'register':
      return <RegisterPage />
    case 'account':
      return <AccountPage />
    case 'orders':
      return <OrdersPage />
    case 'order-detail':
      return <OrderDetailPage id={route.id} />
    case 'favorites':
      return <FavoritesPage />
    case 'comparisons':
      return <ComparisonsPage />
    case 'order-success':
      return <OrderSuccessPage orderNumber={route.orderNumber} />
    case 'admin':
      return <AdminPanel onBack={() => useRouterStore.getState().goHome()} />
    default:
      return <HomePage />
  }
}

export default function Home() {
  const { route } = useRouterStore()
  const { fetchUser, user } = useAuthStore()
  const { fetchCart } = useCartStore()
  const [needsSeed, setNeedsSeed] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSeed() {
      try {
        const res = await fetch('/api/products?limit=1')
        const data = await res.json()
        if (!data.products || data.products.length === 0) {
          setNeedsSeed(true)
        }
      } catch {
        setNeedsSeed(true)
      } finally {
        setChecking(false)
      }
    }
    checkSeed()
    fetchUser()
    fetchCart()
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSeedResult(data)
        setNeedsSeed(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Seed failed:', error)
    } finally {
      setSeeding(false)
    }
  }

  const isAdmin = route.page === 'admin'

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F27A1A]" />
      </div>
    )
  }

  if (needsSeed && !seedResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FFF3E8] rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-[#F27A1A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2744] mb-2">MağazaVitrin Kurulumu</h1>
          <p className="text-gray-500 mb-6">
            Demo verileri yüklenmemiş. Başlamak için demo verileri yükleyin.
          </p>
          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full h-12 bg-[#F27A1A] hover:bg-[#D4630E] text-white font-semibold text-base"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              'Demo Verileri Yükle'
            )}
          </Button>
          {seedResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-700">
              {seedResult.message}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return <AdminPanel onBack={() => useRouterStore.getState().goHome()} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StorefrontHeader />
      <main className="flex-1">
        <PageRouter />
      </main>
      <StorefrontFooter />
    </div>
  )
}
