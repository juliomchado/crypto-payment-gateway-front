import { create } from 'zustand'
import {
  merchantService,
  type CreateMerchantData,
  type UpdateMerchantData,
} from '@/services/merchant.service'
import type { Merchant, MerchantStatus } from '@/models/types'

interface MerchantState {
  merchant: Merchant | null
  merchants: Merchant[]
  isLoading: boolean
  error: string | null
}

interface MerchantActions {
  fetchMerchant: (id: string) => Promise<void>
  fetchCurrentMerchant: () => Promise<void>
  fetchMerchants: () => Promise<void>
  createMerchant: (data: CreateMerchantData) => Promise<Merchant | null>
  updateMerchant: (id: string, data: UpdateMerchantData) => Promise<Merchant | null>
  updateMerchantStatus: (id: string, status: MerchantStatus) => Promise<Merchant | null>
  clearError: () => void
}

type MerchantViewModel = MerchantState & MerchantActions

export const useMerchantViewModel = create<MerchantViewModel>((set) => ({
  merchant: null,
  merchants: [],
  isLoading: false,
  error: null,

  fetchMerchant: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const merchant = await merchantService.getMerchant(id)
      set({ merchant, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch merchant', isLoading: false })
    }
  },

  fetchCurrentMerchant: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const merchant = await merchantService.getCurrent()
      set({ merchant, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch merchant', isLoading: false })
    }
  },

  fetchMerchants: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const merchants = await merchantService.getMerchants()
      set({ merchants, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch merchants', isLoading: false })
    }
  },

  createMerchant: async (data: CreateMerchantData): Promise<Merchant | null> => {
    set({ isLoading: true, error: null })
    try {
      const merchant = await merchantService.createMerchant(data)
      set({ merchant, isLoading: false })
      return merchant
    } catch (err) {
      const error = err as { message?: string; statusCode?: number }
      const errorMessage = error.statusCode
        ? `${error.statusCode}: ${error.message || 'Failed to create merchant'}`
        : error.message || 'Failed to create merchant'
      set({ error: errorMessage, isLoading: false })
      return null
    }
  },

  updateMerchant: async (id: string, data: UpdateMerchantData): Promise<Merchant | null> => {
    set({ isLoading: true, error: null })
    try {
      const merchant = await merchantService.updateMerchant(id, data)
      set({ merchant, isLoading: false })
      return merchant
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to update merchant', isLoading: false })
      return null
    }
  },

  updateMerchantStatus: async (id: string, status: MerchantStatus): Promise<Merchant | null> => {
    set({ isLoading: true, error: null })
    try {
      const merchant = await merchantService.updateMerchantStatus(id, status)
      // Update in merchants array
      set((state) => ({
        merchant,
        merchants: state.merchants.map(m => m.id === id ? merchant : m),
        isLoading: false
      }))
      return merchant
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to update merchant status', isLoading: false })
      return null
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
