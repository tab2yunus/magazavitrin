import { create } from 'zustand'

interface AuthState {
  user: any | null
  isLoading: boolean
  fetchUser: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user, isLoading: false })
      } else {
        set({ user: null, isLoading: false })
      }
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  login: async (email, password) => {
    try {
      // First get CSRF token
      const csrfRes = await fetch('/api/auth/csrf')
      const csrfData = await csrfRes.json()
      
      // Then sign in with credentials
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: csrfData.csrfToken,
          json: 'true',
        }),
      })
      
      if (res.ok) {
        await get().fetchUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        return await get().login(email, password)
      }
      return false
    } catch {
      return false
    }
  },

  logout: async () => {
    try {
      // Get CSRF token for signout
      const csrfRes = await fetch('/api/auth/csrf')
      const csrfData = await csrfRes.json()
      
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          csrfToken: csrfData.csrfToken,
        }),
      })
      set({ user: null })
    } catch {
      set({ user: null })
    }
  },

  isAdmin: () => {
    const user = get().user
    return user?.role === 'super_admin' || user?.role === 'editor'
  },
}))
