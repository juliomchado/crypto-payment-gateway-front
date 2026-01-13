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
    interface BackendLoginResponse {
      user: User
      token: string
    }
    const response = await api.post<ApiResponse<BackendLoginResponse>>('/auth/login', credentials)
    const userData = response.data.user

    // Force MERCHANT role if user has a merchant record
    if (userData && (userData.merchant || userData.merchantId)) {
      userData.role = 'MERCHANT'
    } else if (userData && !userData.role) {
      userData.role = 'USER'
    }

    return { user: userData }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/auth/register', data)
  }

  async logout(): Promise<void> {
    return api.post('/auth/logout')
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return api.post<ApiResponse<null>>('/auth/forgot-password', { email })
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
    return api.post<ApiResponse<null>>('/auth/reset-password', data)
  }

  async verifyEmail(data: VerifyEmailData): Promise<ApiResponse<null>> {
    return api.post<ApiResponse<null>>('/auth/verify-email', data)
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me')
      const userData = response.data

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
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
