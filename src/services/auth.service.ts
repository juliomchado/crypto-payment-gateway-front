import { api } from './api'
import type { User, ApiResponse } from '@/models/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  firstName: string
  lastName: string
  password: string
  country?: string
  language?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface VerifyEmailData {
  token: string
}

export interface AuthResponse {
  user: User
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // api.ts now auto-extracts .data wrapper
    const response = await api.post<any>('/auth/login', credentials)
    const userData = response.user

    // Force MERCHANT role if user has a merchant record
    if (userData && (userData.merchant || userData.merchantId)) {
      userData.role = 'MERCHANT'
    } else if (userData && !userData.role) {
      userData.role = 'USER'
    }

    return { user: userData }
  }

  async register(data: RegisterData): Promise<User> {
    // api.ts now auto-extracts .data wrapper
    const response = await api.post<any>('/auth/register', data)
    return response.user || response
  }

  async logout(): Promise<void> {
    try {
      // Call backend to clear httpOnly cookie
      await api.post('/auth/logout', {})
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with client-side cleanup even if backend fails
    }

    // Clear client-side storage
    if (typeof window !== 'undefined') {
      // Clear cookie as backup
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'token=; path=/; max-age=0;'

      // Set logout flag to prevent checkAuth from re-authenticating
      localStorage.setItem('logging_out', 'true')
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Backend returns { message } directly (not ApiResponse)
    return api.post<{ message: string }>('/auth/forgot-password', { email })
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    // Backend returns { message } directly (not ApiResponse)
    return api.post<{ message: string }>('/auth/reset-password', data)
  }

  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    // Backend returns { message } directly (not ApiResponse)
    return api.post<{ message: string }>('/auth/verify-email', data)
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await api.get<User>('/auth/me')

      if (!userData || !userData.email) {
        return null
      }

      // Infer role and ensure merchantId is populated if merchant data exists
      if (userData.merchant) {
        userData.merchantId = userData.merchantId || userData.merchant.id
        userData.role = 'MERCHANT'
      } else if (userData.merchantId) {
        userData.role = 'MERCHANT'
      } else if (!userData.role) {
        userData.role = 'USER'
      }

      return userData
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error)
      return null
    }
  }
}

export const authService = new AuthService()
