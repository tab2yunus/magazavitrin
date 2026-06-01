'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import StorefrontHeader from '@/components/storefront/storefront-header'
import StorefrontFooter from '@/components/storefront/storefront-footer'
import MobileBottomNav from '@/components/storefront/mobile-bottom-nav'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchUser } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    fetchUser()
    fetchCart()
  }, [fetchUser, fetchCart])

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F1B2D]">
      <StorefrontHeader />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <StorefrontFooter />
      <MobileBottomNav />
    </div>
  )
}
