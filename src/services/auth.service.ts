import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_USER } from '@/models/mock-data'
import type { User, ApiResponse } from '@/models/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      if (credentials.email === 'demo@cryptogateway.com' && credentials.password === 'password') {
        return { user: MOCK_USER }
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
          name: data.name,
          email: data.email,
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

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return { data: null, message: 'Password reset successful' }
    }
    return api.post<ApiResponse<null>>('/auth/reset-password', { token, password })
  }

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return { data: null, message: 'Email verified successfully' }
    }
    return api.post<ApiResponse<null>>('/auth/verify-email', { token })
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
