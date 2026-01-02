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
  checkAuth: () => Promise<void>
  clearError: () => void
}

type AuthViewModel = AuthState & AuthActions

export const useAuthViewModel = create<AuthViewModel>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)
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
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  checkAuth: async (): Promise<void> => {
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
