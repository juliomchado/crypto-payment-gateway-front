import { create } from 'zustand'
import { authService, type LoginCredentials, type RegisterData } from '@/services/auth.service'
import type { User } from '@/models/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: (force?: boolean) => Promise<void>
  clearError: () => void
}

type AuthViewModel = AuthState & AuthActions

export const useAuthViewModel = create<AuthViewModel>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)

      // Clear any logout flags
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logging_out')

        // Persist user session in localStorage for MOCK mode
        if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
          localStorage.setItem('mock_user', JSON.stringify(response.user))
        }
      }

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      })
      return false
    }
  },

  register: async (data: RegisterData): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      await authService.register(data)
      set({ isLoading: false })
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      })
      return false
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true })
    try {
      await authService.logout()

      // Clear localStorage for MOCK mode
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_user')
      }
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  checkAuth: async (force = false): Promise<void> => {
    // Check if user is logging out
    if (typeof window !== 'undefined' && localStorage.getItem('logging_out') === 'true') {
      localStorage.removeItem('logging_out')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    const currentState = useAuthViewModel.getState()

    if (!force && currentState.isAuthenticated && currentState.user) {
      return
    }

    set({ isLoading: true })
    try {
      const user = await authService.getCurrentUser()
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
