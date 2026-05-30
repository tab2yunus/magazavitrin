import { create } from 'zustand'
import type { Product, CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  couponCode: string
  couponDiscount: number
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity: number, variationId?: string, selectedVariations?: Record<string, string>) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  applyCoupon: (code: string) => Promise<boolean>
  clearCart: () => Promise<void>
  getSubtotal: () => number
  getShippingCost: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        set({ 
          items: data.items || [], 
          couponCode: data.couponCode || '',
          couponDiscount: data.couponDiscount || 0,
          isLoading: false 
        })
      } else {
        set({ items: [], isLoading: false })
      }
    } catch {
      set({ items: [], isLoading: false })
    }
  },

  addItem: async (productId, quantity, variationId, selectedVariations) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, variationId, selectedVariations }),
      })
      if (res.ok) {
        const data = await res.json()
        set({ items: data.items || [], isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      })
      if (res.ok) {
        const data = await res.json()
        set({ items: data.items || [], isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      if (res.ok) {
        const data = await res.json()
        set({ items: data.items || [], isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (res.ok) {
        const data = await res.json()
        set({ couponCode: code, couponDiscount: data.discount || 0 })
        return true
      }
      return false
    } catch {
      return false
    }
  },

  clearCart: async () => {
    try {
      await fetch('/api/cart', { method: 'DELETE' })
      set({ items: [], couponCode: '', couponDiscount: 0 })
    } catch {
      // ignore
    }
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product?.discountPrice || item.product?.normalPrice || 0
      return total + price * item.quantity
    }, 0)
  },

  getShippingCost: () => {
    const subtotal = get().getSubtotal()
    return subtotal > 200 ? 0 : 29.99
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const shipping = get().getShippingCost()
    const discount = get().couponDiscount
    return Math.max(0, subtotal - discount + shipping)
  },
}))
