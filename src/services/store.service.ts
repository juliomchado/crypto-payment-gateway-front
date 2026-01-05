import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_STORES, MOCK_STORE_CURRENCIES, MOCK_CURRENCIES } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Store, StoreCurrency, Currency, ApiResponse, PaginatedResponse, StoreStatus } from '@/models/types'

// Request DTOs matching backend API
export interface CreateStoreData {
  name: string                     // 2-100 characters
  slug: string                     // 2-100 chars, lowercase alphanumeric with hyphens, unique
  merchantId: string               // UUID v7
  exchangeRateSourceId: string     // UUID v7
  description?: string             // Max 500 characters
  isActive?: boolean               // Default: true
  urlCallback?: string             // Valid URL
  urlReturn?: string               // Valid URL
  urlSuccess?: string              // Valid URL
  defaultPaymentWindow?: number    // 60-86400 seconds, default: 3600
  defaultCurrency?: string         // Max 10 characters
  feePercent?: number              // 0-100, default: 0
  feeFixed?: number                // Default: 0
  feeCurrency?: string             // Max 10 characters
}

export interface UpdateStoreData {
  name?: string                    // 2-100 characters
  description?: string             // Max 500 characters
  isActive?: boolean
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
  defaultPaymentWindow?: number
  defaultCurrency?: string
  feePercent?: number
  feeFixed?: number
  feeCurrency?: string
}

export interface ListStoresQuery {
  skip?: number                    // Default: 0
  take?: number                    // 1-100, default: 20
  merchantId?: string              // UUID
  isActive?: boolean
}

export interface AddStoreCurrencyData {
  currencyId: string               // UUID v7
  isEnabled?: boolean              // Default: true
  minAmount: string                // Valid decimal number
  maxAmount: string                // Valid decimal number
}

export interface UpdateStoreCurrencyData {
  isEnabled?: boolean
  minAmount?: string               // Valid decimal
  maxAmount?: string               // Valid decimal
}

// Legacy interface for backward compatibility
export interface ConfigureCurrencyData {
  currencyId: string
  minAmount: string                // Changed to string (was number)
  maxAmount: string                // Changed to string (was number)
  isEnabled: boolean
}

class StoreService {
  private mockStores = [...MOCK_STORES]
  private mockStoreCurrencies = [...MOCK_STORE_CURRENCIES]

  async getStores(query?: ListStoresQuery): Promise<Store[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      let filtered = [...this.mockStores]

      if (query?.merchantId) {
        filtered = filtered.filter(s => s.merchantId === query.merchantId)
      }
      if (query?.isActive !== undefined) {
        filtered = filtered.filter(s => s.status === (query.isActive ? 'ACTIVE' : 'INACTIVE'))
      }

      const skip = query?.skip || 0
      const take = query?.take || 20
      return filtered.slice(skip, skip + take)
    }

    const params = new URLSearchParams()
    if (query?.skip) params.append('skip', query.skip.toString())
    if (query?.take) params.append('take', query.take.toString())
    if (query?.merchantId) params.append('merchantId', query.merchantId)
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString())

    const response = await api.get<PaginatedResponse<Store>>(`/stores?${params.toString()}`)
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

      // Check for duplicate slug
      if (this.mockStores.some(s => s.slug === data.slug)) {
        throw { message: 'Store with this slug already exists', statusCode: 400 }
      }

      const newStore: Store = {
        id: generateId(),
        name: data.name,
        slug: data.slug,
        description: data.description,
        merchantId: data.merchantId,
        exchangeRateSourceId: data.exchangeRateSourceId,
        status: data.isActive !== false ? 'ACTIVE' : 'INACTIVE',
        defaultCurrency: data.defaultCurrency,
        defaultPaymentWindow: data.defaultPaymentWindow || 3600,
        feePercent: data.feePercent || 0,
        feeFixed: data.feeFixed || 0,
        feeCurrency: data.feeCurrency,
        urlCallback: data.urlCallback,
        urlReturn: data.urlReturn,
        urlSuccess: data.urlSuccess,
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

      // Map isActive to status
      const statusUpdate: Partial<Store> = {}
      if (data.isActive !== undefined) {
        statusUpdate.status = data.isActive ? 'ACTIVE' : 'INACTIVE'
      }

      this.mockStores[index] = {
        ...this.mockStores[index],
        ...data,
        ...statusUpdate,
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
      // Backend deactivates instead of deleting
      this.mockStores[index].status = 'INACTIVE'
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

  async addStoreCurrency(storeId: string, data: AddStoreCurrencyData): Promise<StoreCurrency> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const currency = MOCK_CURRENCIES.find((c) => c.id === data.currencyId)
      if (!currency) {
        throw { message: 'Currency not found', statusCode: 404 }
      }

      const storeCurrency: StoreCurrency = {
        id: generateId(),
        storeId,
        currencyId: data.currencyId,
        currency,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this.mockStoreCurrencies.push(storeCurrency)
      return storeCurrency
    }

    const response = await api.post<ApiResponse<StoreCurrency>>(
      `/stores/${storeId}/currencies`,
      data
    )
    return response.data
  }

  async updateStoreCurrency(
    storeId: string,
    currencyId: string,
    data: UpdateStoreCurrencyData
  ): Promise<StoreCurrency> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const index = this.mockStoreCurrencies.findIndex(
        (sc) => sc.storeId === storeId && sc.currencyId === currencyId
      )

      if (index === -1) {
        throw { message: 'Store currency not found', statusCode: 404 }
      }

      this.mockStoreCurrencies[index] = {
        ...this.mockStoreCurrencies[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return this.mockStoreCurrencies[index]
    }

    const response = await api.patch<ApiResponse<StoreCurrency>>(
      `/stores/${storeId}/currencies/${currencyId}`,
      data
    )
    return response.data
  }

  // Legacy method for backward compatibility
  async removeStoreCurrency(storeId: string, currencyId: string): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockStoreCurrencies.findIndex(
        (sc) => sc.storeId === storeId && sc.currencyId === currencyId
      )
      if (index === -1) {
        throw { message: 'Store currency not found', statusCode: 404 }
      }
      this.mockStoreCurrencies.splice(index, 1)
      return
    }
    await api.delete(`/stores/${storeId}/currencies/${currencyId}`)
  }

  // Legacy method for backward compatibility
  async configureCurrency(storeId: string, data: ConfigureCurrencyData): Promise<StoreCurrency> {
    const existingCurrency = this.mockStoreCurrencies.find(
      (sc) => sc.storeId === storeId && sc.currencyId === data.currencyId
    )

    if (existingCurrency) {
      return this.updateStoreCurrency(storeId, data.currencyId, {
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled,
      })
    } else {
      return this.addStoreCurrency(storeId, {
        currencyId: data.currencyId,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled,
      })
    }
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const storeService = new StoreService()
