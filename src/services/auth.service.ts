import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_USER, MOCK_MERCHANT_USER, MOCK_ADMIN_USER } from '@/models/mock-data'
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
  language?: string  // Default: 'en'
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string      // 6 character verification token
  password: string   // 8+ chars, uppercase, lowercase, number, special char
}

export interface VerifyEmailData {
  token: string      // 6 character verification token
}

export interface AuthResponse {
  user: User
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      // Check merchant account
      if (credentials.email === 'merchant@cryptogateway.com' && credentials.password === 'password') {
        return { user: MOCK_MERCHANT_USER }
      }

      // Check admin account
      if (credentials.email === 'admin@cryptogateway.com' && credentials.password === 'admin123') {
        return { user: MOCK_ADMIN_USER }
      }

      throw { message: 'Invalid credentials', statusCode: 401 }
    }
    return api.post<AuthResponse>('/auth/login', credentials)
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return {
        data: {
          ...MOCK_USER,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          country: data.country,
          language: data.language || 'en',
        },
        message: 'Registration successful. Please verify your email.',
      }
    }
    return api.post<ApiResponse<User>>('/auth/register', data)
  }

  async logout(): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return
    }
    return api.post('/auth/logout')
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return { data: null, message: 'Password reset email sent' }
    }
    return api.post<ApiResponse<null>>('/auth/forgot-password', { email })
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return { data: null, message: 'Password reset successful' }
    }
    return api.post<ApiResponse<null>>('/auth/reset-password', data)
  }

  async verifyEmail(data: VerifyEmailData): Promise<ApiResponse<null>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return { data: null, message: 'Email verified successfully' }
    }
    return api.post<ApiResponse<null>>('/auth/verify-email', data)
  }

  async getCurrentUser(): Promise<User | null> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay(200)
      return MOCK_USER
    }
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me')
      return response.data
    } catch {
      return null
    }
  }

  private simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const authService = new AuthService()
