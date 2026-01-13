import { CONFIG } from '@/lib/config'
import type { ApiError } from '@/models/types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = CONFIG.API_URL
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API Error ${response.status} at ${endpoint}:`, errorData)
      if (errorData.issues) {
        console.error('Validation Issues:', JSON.stringify(errorData.issues, null, 2))
      }

      // Auto-logout on 401 Unauthorized
      if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        console.log('[API] 401 Unauthorized - Redirecting to login')
        window.location.href = '/login'
      }

      const error: ApiError = {
        message: errorData.message || 'An unexpected error occurred',
        statusCode: response.status,
        error: errorData.error,
      }
      throw error
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  async put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }

  async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers })
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}

export const api = new ApiService()
