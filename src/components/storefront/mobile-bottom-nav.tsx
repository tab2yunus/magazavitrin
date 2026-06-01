'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Search, Heart, User, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useBrand } from '@/lib/brand-context'

interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>
  isCenter?: boolean
  badge?: number
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { items } = useCartStore()
  const { theme } = useBrand()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navItems: NavItem[] = [
    { href: '/', label: 'Ana Sayfa', Icon: Home },
    { href: '/kategori/tum-urunler', label: 'Kategoriler', Icon: LayoutGrid },
    { href: '/ara', label: 'Ara', Icon: Search, isCenter: true },
    { href: '/favorilerim', label: 'Favoriler', Icon: Heart },
    { href: '/hesabim', label: 'Hesabım', Icon: User, badge: cartItemCount },
  ]

  // Theme color shortcuts
  const primary = theme.colorPrimary
  const textMuted = theme.colorTextMuted
  const border = theme.colorBorder

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Shadow layer */}
      <div className="h-px bg-gradient-to-b from-transparent to-black/5" />
      <div className="shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.12)]">
        <div className="bg-white border-t" style={{ borderColor: border }}>
          <div className="flex items-end justify-around h-16">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const isCenter = item.isCenter

              if (isCenter) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center -mt-5 relative"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95"
                      style={{
                        background: primary,
                        boxShadow: `0 4px 14px ${primary}4D`,
                      }}
                    >
                      <item.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5" style={{ color: primary }}>
                      {item.label}
                    </span>
                  </Link>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 relative min-w-[56px] py-1 transition-colors"
                >
                  <div className="relative">
                    <item.Icon
                      className="w-5 h-5 transition-colors"
                      style={{ color: active ? primary : textMuted }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1 leading-none"
                        style={{ background: primary }}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium transition-colors"
                    style={{ color: active ? primary : textMuted }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: primary }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
