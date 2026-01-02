import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_API_KEYS } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { ApiKey, ApiResponse } from '@/models/types'

export interface CreateApiKeyData {
  storeId: string
  name: string
  permissions: string[]
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  secretKey: string
}

class ApiKeyService {
  private mockApiKeys = [...MOCK_API_KEYS]

  async getApiKeys(storeId: string): Promise<ApiKey[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockApiKeys.filter((key) => key.storeId === storeId && !key.revokedAt)
    }
    const response = await api.get<ApiResponse<ApiKey[]>>(`/stores/${storeId}/api-keys`)
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
      const newKey: ApiKey = {
        id: generateId(),
        storeId: data.storeId,
        name: data.name,
        keyPrefix: 'pk_live_',
        permissions: data.permissions,
        createdAt: new Date().toISOString(),
      }
      this.mockApiKeys.push(newKey)

      const secretKey =
        'pk_live_' +
        Array.from({ length: 32 }, () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
            Math.floor(Math.random() * 62)
          ]
        ).join('')

      return { apiKey: newKey, secretKey }
    }
    const response = await api.post<ApiResponse<CreateApiKeyResponse>>(
      `/stores/${data.storeId}/api-keys`,
      data
    )
    return response.data
  }

  async revokeApiKey(keyId: string): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockApiKeys.findIndex((key) => key.id === keyId)
      if (index === -1) {
        throw { message: 'API Key not found', statusCode: 404 }
      }
      this.mockApiKeys[index] = {
        ...this.mockApiKeys[index],
        revokedAt: new Date().toISOString(),
      }
      return
    }
    await api.patch(`/api-keys/${keyId}/revoke`)
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const apiKeyService = new ApiKeyService()
