import { create } from 'zustand'
import {
  storeService,
  type CreateStoreData,
  type UpdateStoreData,
  type ConfigureCurrencyData,
} from '@/services/store.service'
import type { Store, StoreCurrency, Currency } from '@/models/types'

interface StoreState {
  stores: Store[]
  selectedStore: Store | null
  storeCurrencies: StoreCurrency[]
  availableCurrencies: Currency[]
  isLoading: boolean
  error: string | null
}

interface StoreActions {
  fetchStores: () => Promise<void>
  fetchStore: (id: string) => Promise<void>
  createStore: (data: CreateStoreData) => Promise<Store | null>
  updateStore: (id: string, data: UpdateStoreData) => Promise<boolean>
  deleteStore: (id: string) => Promise<boolean>
  fetchStoreCurrencies: (storeId: string) => Promise<void>
  fetchAvailableCurrencies: () => Promise<void>
  configureCurrency: (storeId: string, data: ConfigureCurrencyData) => Promise<boolean>
  selectStore: (store: Store | null) => void
  clearError: () => void
}

type StoreViewModel = StoreState & StoreActions

export const useStoreViewModel = create<StoreViewModel>((set, get) => ({
  stores: [],
  selectedStore: null,
  storeCurrencies: [],
  availableCurrencies: [],
  isLoading: false,
  error: null,

  fetchStores: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const stores = await storeService.getStores()
      set({ stores, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch stores', isLoading: false })
    }
  },

  fetchStore: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const store = await storeService.getStore(id)
      set({ selectedStore: store, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch store', isLoading: false })
    }
  },

  createStore: async (data: CreateStoreData): Promise<Store | null> => {
    set({ isLoading: true, error: null })
    try {
      const store = await storeService.createStore(data)
      set((state) => ({
        stores: [...state.stores, store],
        isLoading: false,
      }))
      return store
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to create store', isLoading: false })
      return null
    }
  },

  updateStore: async (id: string, data: UpdateStoreData): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const updatedStore = await storeService.updateStore(id, data)
      set((state) => ({
        stores: state.stores.map((s) => (s.id === id ? updatedStore : s)),
        selectedStore: state.selectedStore?.id === id ? updatedStore : state.selectedStore,
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to update store', isLoading: false })
      return false
    }
  },

  deleteStore: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      await storeService.deleteStore(id)
      set((state) => ({
        stores: state.stores.filter((s) => s.id !== id),
        selectedStore: state.selectedStore?.id === id ? null : state.selectedStore,
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to delete store', isLoading: false })
      return false
    }
  },

  fetchStoreCurrencies: async (storeId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const currencies = await storeService.getStoreCurrencies(storeId)
      set({ storeCurrencies: currencies, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch store currencies', isLoading: false })
    }
  },

  fetchAvailableCurrencies: async (): Promise<void> => {
    try {
      const currencies = await storeService.getAvailableCurrencies()
      set({ availableCurrencies: currencies })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch currencies' })
    }
  },

  configureCurrency: async (storeId: string, data: ConfigureCurrencyData): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const storeCurrency = await storeService.configureCurrency(storeId, data)
      set((state) => {
        const existingIndex = state.storeCurrencies.findIndex(
          (sc) => sc.currencyId === data.currencyId
        )
        if (existingIndex >= 0) {
          const updated = [...state.storeCurrencies]
          updated[existingIndex] = storeCurrency
          return { storeCurrencies: updated, isLoading: false }
        }
        return {
          storeCurrencies: [...state.storeCurrencies, storeCurrency],
          isLoading: false,
        }
      })
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to configure currency', isLoading: false })
      return false
    }
  },

  selectStore: (store: Store | null): void => {
    set({ selectedStore: store })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
