'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import StorefrontHeader from '@/components/storefront/storefront-header'
import StorefrontFooter from '@/components/storefront/storefront-footer'
import { Button } from '@/components/ui/button'
import { Database, Loader2 } from 'lucide-react'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  }, [fetchUser, fetchCart])

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
