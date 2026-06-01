'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import StorefrontHeader from '@/components/storefront/storefront-header'
import StorefrontFooter from '@/components/storefront/storefront-footer'

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
    <div className="min-h-screen flex flex-col bg-white">
      <StorefrontHeader />
      <main className="flex-1">
        {children}
      </main>
      <StorefrontFooter />
    </div>
  )
}
