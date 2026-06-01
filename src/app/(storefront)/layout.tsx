'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useBrand } from '@/lib/brand-context'
import StorefrontHeader from '@/components/storefront/storefront-header'
import StorefrontFooter from '@/components/storefront/storefront-footer'
import MobileBottomNav from '@/components/storefront/mobile-bottom-nav'
import CommandPalette from '@/components/storefront/command-palette'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchUser } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { theme } = useBrand()

  useEffect(() => {
    fetchUser()
    fetchCart()
  }, [fetchUser, fetchCart])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.colorBackground, color: theme.colorText }}
    >
      <StorefrontHeader />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <StorefrontFooter />
      <MobileBottomNav />
      <CommandPalette />
    </div>
  )
}
