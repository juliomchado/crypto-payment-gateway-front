import { api } from './api'
import type { ApiKey, ApiResponse, ApiKeyType } from '@/models/types'

export interface CreateApiKeyData {
  storeId: string
  name: string
  type: ApiKeyType
}

// Backend returns flat object with key + secret (only visible once!)
export interface ApiKeyCreatedResponse {
  id: string
  storeId: string
  name: string
  type: string
  key: string
  secret: string  // Only visible once!
  status: string
  createdAt: string
}

// Backend returns { old, new } structure for rotation
export interface RotateApiKeyResponse {
  old: {
    id: string
    status: 'REVOKED'
  }
  new: {
    id: string
    key: string
    secret: string  // Only visible once!
    status: 'ACTIVE'
  }
}

class ApiKeyService {
  async getApiKeys(storeId: string): Promise<ApiKey[]> {
    // Backend returns { data, total } structure
    interface ListApiKeysResponse {
      data: ApiKey[]
      total: number
    }
    const response = await api.get<ListApiKeysResponse>(`/store/${storeId}/api-keys`)
    return response.data
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    // Backend returns { data, total } structure
    interface ListApiKeysResponse {
      data: ApiKey[]
      total: number
    }
    const response = await api.get<ListApiKeysResponse>('/api-keys')
    return response.data
  }

  async createApiKey(data: CreateApiKeyData): Promise<ApiKeyCreatedResponse> {
    // Backend returns flat object with key and secret (not wrapped in ApiResponse)
    const response = await api.post<ApiKeyCreatedResponse>(
      `/store/${data.storeId}/api-keys`,
      { name: data.name, type: data.type }
    )
    return response
  }

  async revokeApiKey(storeId: string, keyId: string): Promise<ApiKey> {
    // Backend returns updated ApiKey directly (not wrapped in ApiResponse)
    const response = await api.patch<ApiKey>(
      `/store/${storeId}/api-keys/${keyId}/revoke`
    )
    return response
  }

  async rotateApiKey(storeId: string, keyId: string): Promise<RotateApiKeyResponse> {
    // Backend returns { old, new } structure (not wrapped in ApiResponse)
    const response = await api.patch<RotateApiKeyResponse>(
      `/store/${storeId}/api-keys/${keyId}/rotate`
    )
    return response
  }
}

export const apiKeyService = new ApiKeyService()
