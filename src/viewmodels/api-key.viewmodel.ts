import { create } from 'zustand'
import {
  apiKeyService,
  type CreateApiKeyData,
  type ApiKeyCreatedResponse,
  type RotateApiKeyResponse,
} from '@/services/api-key.service'
import type { ApiKey } from '@/models/types'

interface ApiKeyState {
  apiKeys: ApiKey[]
  newlyCreatedKey: ApiKeyCreatedResponse | null
  isLoading: boolean
  error: string | null
}

interface ApiKeyActions {
  fetchApiKeys: (storeId: string) => Promise<void>
  fetchAllApiKeys: () => Promise<void>
  createApiKey: (data: CreateApiKeyData) => Promise<ApiKeyCreatedResponse | null>
  revokeApiKey: (storeId: string, keyId: string) => Promise<boolean>
  rotateApiKey: (storeId: string, keyId: string) => Promise<RotateApiKeyResponse | null>
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
      set({ apiKeys: Array.isArray(apiKeys) ? apiKeys : [], isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch API keys', isLoading: false })
    }
  },

  fetchAllApiKeys: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const apiKeys = await apiKeyService.getAllApiKeys()
      set({ apiKeys: Array.isArray(apiKeys) ? apiKeys : [], isLoading: false })
    } catch (err) {
      // If global fetch fails (e.g. 404), just show empty list instead of error
      set({ apiKeys: [], isLoading: false })
    }
  },

  createApiKey: async (data: CreateApiKeyData): Promise<ApiKeyCreatedResponse | null> => {
    set({ isLoading: true, error: null })
    try {
      // Backend returns flat object with id, key, secret, etc.
      const response = await apiKeyService.createApiKey(data)
      // Convert to ApiKey format (without secret) for list
      const apiKeyForList: ApiKey = {
        id: response.id,
        storeId: response.storeId,
        name: response.name,
        type: response.type as any,
        key: response.key,
        status: response.status as any,
        createdAt: response.createdAt,
        updatedAt: response.createdAt, // Use createdAt as updatedAt for new keys
      }
      set((state) => ({
        apiKeys: [...state.apiKeys, apiKeyForList],
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

  rotateApiKey: async (storeId: string, keyId: string): Promise<RotateApiKeyResponse | null> => {
    set({ isLoading: true, error: null })
    try {
      // Backend returns { old: {...}, new: {...} } structure
      const response = await apiKeyService.rotateApiKey(storeId, keyId)
      // Convert new key to ApiKey format for list
      const newApiKeyForList: ApiKey = {
        id: response.new.id,
        storeId: storeId,
        name: '', // Name is not returned in rotate response
        type: 'PAYMENT' as any,
        key: response.new.key,
        status: response.new.status as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set((state) => ({
        apiKeys: state.apiKeys.map((key) =>
          key.id === keyId ? { ...key, status: 'REVOKED' as const } : key
        ).concat(newApiKeyForList),
        newlyCreatedKey: {
          id: response.new.id,
          storeId: storeId,
          name: '',
          type: 'PAYMENT',
          key: response.new.key,
          secret: response.new.secret,
          status: response.new.status,
          createdAt: new Date().toISOString(),
        },
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
