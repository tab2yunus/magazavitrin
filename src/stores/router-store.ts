import { create } from 'zustand'

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

interface RouterState {
  route: Route
  navigate: (route: Route) => void
  goHome: () => void
}

export const useRouterStore = create<RouterState>((set) => {
  const getInitialRoute = (): Route => {
    if (typeof window === 'undefined') return { page: 'home' }
    const hash = window.location.hash.slice(1)
    if (!hash) return { page: 'home' }
    try {
      return JSON.parse(hash) as Route
    } catch {
      return { page: 'home' }
    }
  }

  return {
    route: getInitialRoute(),
    navigate: (route: Route) => {
      set({ route })
      window.location.hash = JSON.stringify(route)
      window.scrollTo(0, 0)
    },
    goHome: () => {
      set({ route: { page: 'home' } })
      window.location.hash = ''
      window.scrollTo(0, 0)
    },
  }
})

// Listen to hash changes (browser back/forward)
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      useRouterStore.setState({ route: { page: 'home' } })
      return
    }
    try {
      const route = JSON.parse(hash) as Route
      useRouterStore.setState({ route })
    } catch {
      useRouterStore.setState({ route: { page: 'home' } })
    }
  })
}
