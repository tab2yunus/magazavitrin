import { create } from 'zustand'

interface FavoritesState {
  productIds: string[]
  isLoading: boolean
  fetchFavorites: () => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  productIds: [],
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        set({ productIds: data.map((f: any) => f.productId), isLoading: false })
      } else {
        set({ productIds: [], isLoading: false })
      }
    } catch {
      set({ productIds: [], isLoading: false })
    }
  },

  toggleFavorite: async (productId) => {
    const isFav = get().productIds.includes(productId)
    try {
      const res = await fetch('/api/favorites', {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        if (isFav) {
          set({ productIds: get().productIds.filter(id => id !== productId) })
        } else {
          set({ productIds: [...get().productIds, productId] })
        }
      }
    } catch {
      // ignore
    }
  },

  isFavorite: (productId) => {
    return get().productIds.includes(productId)
  },
}))

interface ComparisonState {
  productIds: string[]
  fetchComparisons: () => Promise<void>
  toggleComparison: (productId: string) => Promise<void>
  isComparing: (productId: string) => boolean
  clearComparisons: () => void
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  productIds: [],

  fetchComparisons: async () => {
    try {
      const res = await fetch('/api/comparisons')
      if (res.ok) {
        const data = await res.json()
        set({ productIds: data.map((c: any) => c.productId).filter(Boolean) })
      }
    } catch {
      // ignore
    }
  },

  toggleComparison: async (productId) => {
    const isComp = get().productIds.includes(productId)
    if (isComp) {
      set({ productIds: get().productIds.filter(id => id !== productId) })
      await fetch('/api/comparisons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    } else {
      if (get().productIds.length >= 4) return // max 4 products
      set({ productIds: [...get().productIds, productId] })
      await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    }
  },

  isComparing: (productId) => {
    return get().productIds.includes(productId)
  },

  clearComparisons: () => {
    set({ productIds: [] })
    fetch('/api/comparisons', { method: 'DELETE' }).catch(() => {})
  },
}))
