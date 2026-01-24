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
        ...(body ? { 'Content-Type': 'application/json' } : {}),
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

      // Extract error message - try different structures from backend
      let errorMessage = 'An unexpected error occurred'

      // Try direct message
      if (errorData.message) {
        errorMessage = errorData.message
      }
      // Try nested error.message
      else if (errorData.error?.message) {
        errorMessage = errorData.error.message
      }
      // Try issues array (Zod validation)
      else if (errorData.issues && Array.isArray(errorData.issues)) {
        errorMessage = errorData.issues.map((issue: any) => issue.message).join(', ')
      }
      // Try errors array
      else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ')
      }

      console.log(`[API] Status ${response.status} - Error message from backend: "${errorMessage}"`)
      console.log(`[API] Raw error data:`, errorData)

      const error: ApiError = {
        message: errorMessage,
        statusCode: response.status,
        error: errorData.error,
      }
      throw error
    }

    if (response.status === 204) {
      return {} as T
    }

    const jsonData = await response.json()

    // Backend pode retornar { success: true, data: T } ou T direto
    // Extrair .data se existir, senão retornar direto
    if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
      return jsonData.data as T
    }

    return jsonData as T
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
