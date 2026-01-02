import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_STORES, MOCK_STORE_CURRENCIES, MOCK_CURRENCIES } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Store, StoreCurrency, Currency, ApiResponse, PaginatedResponse } from '@/models/types'

export interface CreateStoreData {
  name: string
  merchantId: string
}

export interface UpdateStoreData {
  name?: string
  isActive?: boolean
}

export interface ConfigureCurrencyData {
  currencyId: string
  minAmount: number
  maxAmount: number
  isEnabled: boolean
}

class StoreService {
  private mockStores = [...MOCK_STORES]
  private mockStoreCurrencies = [...MOCK_STORE_CURRENCIES]

  async getStores(): Promise<Store[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockStores
    }
    const response = await api.get<PaginatedResponse<Store>>('/stores')
    return response.data
  }

  async getStore(id: string): Promise<Store> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const store = this.mockStores.find((s) => s.id === id)
      if (!store) {
        throw { message: 'Store not found', statusCode: 404 }
      }
      return store
    }
    const response = await api.get<ApiResponse<Store>>(`/stores/${id}`)
    return response.data
  }

  async createStore(data: CreateStoreData): Promise<Store> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const newStore: Store = {
        id: generateId(),
        name: data.name,
        merchantId: data.merchantId,
        isActive: true,
        invoiceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockStores.push(newStore)
      return newStore
    }
    const response = await api.post<ApiResponse<Store>>('/stores', data)
    return response.data
  }

  async updateStore(id: string, data: UpdateStoreData): Promise<Store> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockStores.findIndex((s) => s.id === id)
      if (index === -1) {
        throw { message: 'Store not found', statusCode: 404 }
      }
      this.mockStores[index] = {
        ...this.mockStores[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return this.mockStores[index]
    }
    const response = await api.patch<ApiResponse<Store>>(`/stores/${id}`, data)
    return response.data
  }

  async deleteStore(id: string): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockStores.findIndex((s) => s.id === id)
      if (index === -1) {
        throw { message: 'Store not found', statusCode: 404 }
      }
      this.mockStores.splice(index, 1)
      return
    }
    await api.delete(`/stores/${id}`)
  }

  async getStoreCurrencies(storeId: string): Promise<StoreCurrency[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockStoreCurrencies.filter((sc) => sc.storeId === storeId)
    }
    const response = await api.get<ApiResponse<StoreCurrency[]>>(`/stores/${storeId}/currencies`)
    return response.data
  }

  async getAvailableCurrencies(): Promise<Currency[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return MOCK_CURRENCIES
    }
    const response = await api.get<ApiResponse<Currency[]>>('/currencies')
    return response.data
  }

  async configureCurrency(storeId: string, data: ConfigureCurrencyData): Promise<StoreCurrency> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const existingIndex = this.mockStoreCurrencies.findIndex(
        (sc) => sc.storeId === storeId && sc.currencyId === data.currencyId
      )
      const currency = MOCK_CURRENCIES.find((c) => c.id === data.currencyId)
      if (!currency) {
        throw { message: 'Currency not found', statusCode: 404 }
      }

      const storeCurrency: StoreCurrency = {
        id: existingIndex >= 0 ? this.mockStoreCurrencies[existingIndex].id : generateId(),
        storeId,
        currencyId: data.currencyId,
        currency,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled,
      }

      if (existingIndex >= 0) {
        this.mockStoreCurrencies[existingIndex] = storeCurrency
      } else {
        this.mockStoreCurrencies.push(storeCurrency)
      }

      return storeCurrency
    }
    const response = await api.post<ApiResponse<StoreCurrency>>(
      `/stores/${storeId}/currencies`,
      data
    )
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const storeService = new StoreService()
