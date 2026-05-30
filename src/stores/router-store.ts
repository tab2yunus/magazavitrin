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

function parseRouteFromHash(): Route {
  if (typeof window === 'undefined') return { page: 'home' }
  const raw = window.location.hash.slice(1)
  if (!raw) return { page: 'home' }
  try {
    // Browser may URL-encode the hash, so decode first
    const decoded = decodeURIComponent(raw)
    return JSON.parse(decoded) as Route
  } catch {
    try {
      // Fallback: try parsing raw value directly
      return JSON.parse(raw) as Route
    } catch {
      return { page: 'home' }
    }
  }
}

interface RouterState {
  route: Route
  navigate: (route: Route) => void
  goHome: () => void
}

export const useRouterStore = create<RouterState>((set) => {
  return {
    route: parseRouteFromHash(),
    navigate: (route: Route) => {
      set({ route })
      // Use encodeURIComponent so the hash is safely encoded
      window.location.hash = encodeURIComponent(JSON.stringify(route))
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
    const route = parseRouteFromHash()
    useRouterStore.setState({ route })
  })
}
