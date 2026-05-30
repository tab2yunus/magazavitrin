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
      // Step 1: Verify credentials via our custom endpoint
      const verifyRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!verifyRes.ok) {
        return false
      }

      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return false
      }

      // Step 2: Get CSRF token from NextAuth
      const csrfRes = await fetch('/api/auth/csrf')
      const csrfData = await csrfRes.json()

      // Step 3: Sign in via NextAuth credentials callback
      // This sets the session cookie properly
      const signInRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: csrfData.csrfToken,
          json: 'true',
        }),
        redirect: 'follow',
      })

      // NextAuth returns 200 with redirect URL on success
      // or an error URL on failure
      if (signInRes.ok) {
        const text = await signInRes.text()
        try {
          const data = JSON.parse(text)
          // If redirect URL contains "signin" with error, login failed
          if (data.url && data.url.includes('signin') && data.url.includes('error')) {
            return false
          }
        } catch {
          // Non-JSON response, but 200 OK - likely success
        }

        // Wait a moment for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 500))

        // Fetch user to confirm session
        await get().fetchUser()
        return !!get().user
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
