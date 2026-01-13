import { api } from './api'
import type { ApiKey, ApiResponse, ApiKeyType } from '@/models/types'

export interface CreateApiKeyData {
  storeId: string
  name: string
  type: ApiKeyType
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  key: string
}

class ApiKeyService {
  async getApiKeys(storeId: string): Promise<ApiKey[]> {
    const response = await api.get<ApiResponse<ApiKey[]>>(`/store/${storeId}/api-keys`)
    return response.data
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    const response = await api.get<ApiResponse<ApiKey[]>>('/api-keys')
    return response.data
  }

  async createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResponse> {
    const response = await api.post<ApiResponse<CreateApiKeyResponse>>(
      `/store/${data.storeId}/api-keys`,
      { name: data.name, type: data.type }
    )
    return response.data
  }

  async revokeApiKey(storeId: string, keyId: string): Promise<ApiKey> {
    const response = await api.patch<ApiResponse<ApiKey>>(
      `/store/${storeId}/api-keys/${keyId}/revoke`
    )
    return response.data
  }

  async rotateApiKey(storeId: string, keyId: string): Promise<CreateApiKeyResponse> {
    const response = await api.patch<ApiResponse<CreateApiKeyResponse>>(
      `/store/${storeId}/api-keys/${keyId}/rotate`
    )
    return response.data
  }
}

export const apiKeyService = new ApiKeyService()
