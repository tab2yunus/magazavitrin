import { create } from 'zustand'

// Keep the Route type for backward compatibility with components that still reference it
export type Route = 
  | { page: 'home' }
  | { page: 'category'; slug: string }
  | { page: 'brand'; slug: string }
  | { page: 'store'; slug: string }
  | { page: 'product'; slug: string }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'search'; q: string }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'account' }
  | { page: 'orders' }
  | { page: 'order-detail'; id: string }
  | { page: 'favorites' }
  | { page: 'comparisons' }
  | { page: 'order-success'; orderNumber: string }
  | { page: 'admin'; tab?: string }

// Map route objects to SEO-friendly Next.js paths
export function routeToPath(route: Route): string {
  switch (route.page) {
    case 'home':
      return '/'
    case 'product':
      return `/urun/${route.slug}`
    case 'category':
      return `/kategori/${route.slug}`
    case 'brand':
      return `/marka/${route.slug}`
    case 'store':
      return `/magaza/${route.slug}`
    case 'search':
      return `/ara?q=${encodeURIComponent(route.q)}`
    case 'cart':
      return '/sepet'
    case 'checkout':
      return '/odeme'
    case 'login':
      return '/giris'
    case 'register':
      return '/kayit'
    case 'account':
      return '/hesabim'
    case 'orders':
      return '/siparislerim'
    case 'order-detail':
      return `/siparislerim/${route.id}`
    case 'favorites':
      return '/favorilerim'
    case 'comparisons':
      return '/karsilastirma'
    case 'order-success':
      return `/siparis-basarili?orderNumber=${encodeURIComponent(route.orderNumber)}`
    case 'admin':
      return '/admin'
    default:
      return '/'
  }
}

interface RouterState {
  // Keep route state for components that still use it (e.g., highlighting active nav)
  route: Route
  navigate: (route: Route) => void
  goHome: () => void
}

export const useRouterStore = create<RouterState>((set) => {
  return {
    route: { page: 'home' },
    navigate: (route: Route) => {
      set({ route })
      const path = routeToPath(route)
      // Use Next.js-compatible navigation via window.location
      // Components should prefer using Link or router.push() from next/navigation
      // But this provides a fallback for components that call navigate() directly
      window.location.href = path
    },
    goHome: () => {
      set({ route: { page: 'home' } })
      window.location.href = '/'
    },
  }
})
