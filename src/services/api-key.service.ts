import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_API_KEYS } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { ApiKey, ApiResponse, ApiKeyType, ApiKeyStatus } from '@/models/types'

// Request DTO matching backend API
export interface CreateApiKeyData {
  storeId: string
  name: string                    // 2-100 characters
  type: ApiKeyType                // 'PAYMENT' | 'PAYOUT'
}

// Response when creating a new API key (includes full key only once)
export interface CreateApiKeyResponse {
  apiKey: ApiKey
  key: string                     // Full API key (only shown once)
}

class ApiKeyService {
  private mockApiKeys = [...MOCK_API_KEYS]

  async getApiKeys(storeId: string): Promise<ApiKey[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockApiKeys.filter((key) => key.storeId === storeId && key.status === 'ACTIVE')
    }
    const response = await api.get<ApiResponse<ApiKey[]>>(`/store/${storeId}/api-keys`)
    return response.data
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockApiKeys
    }
    const response = await api.get<ApiResponse<ApiKey[]>>('/api-keys')
    return response.data
  }

  async createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResponse> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      // Generate a mock API key
      const fullKey =
        'pk_live_' +
        Array.from({ length: 32 }, () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
            Math.floor(Math.random() * 62)
          ]
        ).join('')

      const newKey: ApiKey = {
        id: generateId(),
        storeId: data.storeId,
        name: data.name,
        type: data.type,
        keyHint: fullKey.slice(-4),  // Last 4 characters
        status: 'ACTIVE',
        userId: 'mock-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockApiKeys.push(newKey)

      return { apiKey: newKey, key: fullKey }
    }

    const response = await api.post<ApiResponse<CreateApiKeyResponse>>(
      `/store/${data.storeId}/api-keys`,
      { name: data.name, type: data.type }
    )
    return response.data
  }

  async revokeApiKey(storeId: string, keyId: string): Promise<ApiKey> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockApiKeys.findIndex((key) => key.id === keyId)
      if (index === -1) {
        throw { message: 'API Key not found', statusCode: 404 }
      }
      this.mockApiKeys[index] = {
        ...this.mockApiKeys[index],
        status: 'REVOKED' as ApiKeyStatus,
        updatedAt: new Date().toISOString(),
      }
      return this.mockApiKeys[index]
    }

    const response = await api.patch<ApiResponse<ApiKey>>(
      `/store/${storeId}/api-keys/${keyId}/revoke`
    )
    return response.data
  }

  async rotateApiKey(storeId: string, keyId: string): Promise<CreateApiKeyResponse> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const index = this.mockApiKeys.findIndex((key) => key.id === keyId)
      if (index === -1) {
        throw { message: 'API Key not found', statusCode: 404 }
      }

      const oldKey = this.mockApiKeys[index]

      // Revoke the old key
      this.mockApiKeys[index] = {
        ...oldKey,
        status: 'REVOKED' as ApiKeyStatus,
        updatedAt: new Date().toISOString(),
      }

      // Generate a new API key
      const fullKey =
        'pk_live_' +
        Array.from({ length: 32 }, () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
            Math.floor(Math.random() * 62)
          ]
        ).join('')

      const newKey: ApiKey = {
        id: generateId(),
        storeId: oldKey.storeId,
        name: oldKey.name,
        type: oldKey.type,
        keyHint: fullKey.slice(-4),
        status: 'ACTIVE',
        userId: oldKey.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockApiKeys.push(newKey)

      return { apiKey: newKey, key: fullKey }
    }

    const response = await api.patch<ApiResponse<CreateApiKeyResponse>>(
      `/store/${storeId}/api-keys/${keyId}/rotate`
    )
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const apiKeyService = new ApiKeyService()
