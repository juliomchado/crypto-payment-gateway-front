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
  revokeApiKey: (keyId: string) => Promise<boolean>
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

  revokeApiKey: async (keyId: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      await apiKeyService.revokeApiKey(keyId)
      set((state) => ({
        apiKeys: state.apiKeys.map((key) =>
          key.id === keyId ? { ...key, revokedAt: new Date().toISOString() } : key
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

  clearNewlyCreatedKey: (): void => {
    set({ newlyCreatedKey: null })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
