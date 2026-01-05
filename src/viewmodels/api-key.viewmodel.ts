import { create } from 'zustand'
import {
  apiKeyService,
  type CreateApiKeyData,
  type CreateApiKeyResponse,
} from '@/services/api-key.service'
import type { ApiKey } from '@/models/types'

interface ApiKeyState {
  apiKeys: ApiKey[]
  newlyCreatedKey: CreateApiKeyResponse | null
  isLoading: boolean
  error: string | null
}

interface ApiKeyActions {
  fetchApiKeys: (storeId: string) => Promise<void>
  fetchAllApiKeys: () => Promise<void>
  createApiKey: (data: CreateApiKeyData) => Promise<CreateApiKeyResponse | null>
  revokeApiKey: (storeId: string, keyId: string) => Promise<boolean>
  rotateApiKey: (storeId: string, keyId: string) => Promise<CreateApiKeyResponse | null>
  clearNewlyCreatedKey: () => void
  clearError: () => void
}

type ApiKeyViewModel = ApiKeyState & ApiKeyActions

export const useApiKeyViewModel = create<ApiKeyViewModel>((set) => ({
  apiKeys: [],
  newlyCreatedKey: null,
  isLoading: false,
  error: null,

  fetchApiKeys: async (storeId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const apiKeys = await apiKeyService.getApiKeys(storeId)
      set({ apiKeys, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch API keys', isLoading: false })
    }
  },

  fetchAllApiKeys: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const apiKeys = await apiKeyService.getAllApiKeys()
      set({ apiKeys, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch API keys', isLoading: false })
    }
  },

  createApiKey: async (data: CreateApiKeyData): Promise<CreateApiKeyResponse | null> => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiKeyService.createApiKey(data)
      set((state) => ({
        apiKeys: [...state.apiKeys, response.apiKey],
        newlyCreatedKey: response,
        isLoading: false,
      }))
      return response
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to create API key', isLoading: false })
      return null
    }
  },

  revokeApiKey: async (storeId: string, keyId: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const revokedKey = await apiKeyService.revokeApiKey(storeId, keyId)
      set((state) => ({
        apiKeys: state.apiKeys.map((key) =>
          key.id === keyId ? revokedKey : key
        ),
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to revoke API key', isLoading: false })
      return false
    }
  },

  rotateApiKey: async (storeId: string, keyId: string): Promise<CreateApiKeyResponse | null> => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiKeyService.rotateApiKey(storeId, keyId)
      set((state) => ({
        apiKeys: state.apiKeys.map((key) =>
          key.id === keyId ? { ...key, status: 'REVOKED' as const } : key
        ).concat(response.apiKey),
        newlyCreatedKey: response,
        isLoading: false,
      }))
      return response
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to rotate API key', isLoading: false })
      return null
    }
  },

  clearNewlyCreatedKey: (): void => {
    set({ newlyCreatedKey: null })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
