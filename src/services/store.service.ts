import { api } from './api'
import type { Store, StoreCurrency, Currency, ApiResponse, PaginatedResponse, StoreStatus } from '@/models/types'

export interface CreateStoreData {
  name: string
  slug: string
  description?: string
  status?: StoreStatus
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
  // merchantId is auto-assigned from JWT token
  // exchangeRateSourceId not used in creation
}

export interface CreateStoreResponse {
  store: Store
  apiKeys: {
    payment: string
  }
}

export interface UpdateStoreData {
  name?: string
  description?: string
  status?: StoreStatus
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
}

export interface ListStoresQuery {
  page?: number
  limit?: number
  merchantId?: string
  status?: StoreStatus
}

export interface AddStoreCurrencyData {
  currencyId: string
  isEnabled?: boolean
  minAmount: string
  maxAmount: string
}

export interface UpdateStoreCurrencyData {
  isEnabled?: boolean
  minAmount?: string
  maxAmount?: string
}

export interface ConfigureCurrencyData {
  currencyId: string
  minAmount: string
  maxAmount: string
  isEnabled: boolean
}

class StoreService {
  async getStores(query?: ListStoresQuery): Promise<Store[]> {
    const params = new URLSearchParams()
    // Backend uses skip/take pagination, not page/limit
    const page = query?.page || 1
    const limit = query?.limit || 20
    const skip = (page - 1) * limit
    params.append('skip', skip.toString())
    params.append('take', limit.toString())
    if (query?.merchantId) params.append('merchantId', query.merchantId)
    if (query?.status) params.append('status', query.status)

    const response = await api.get<Store[]>(`/stores?${params.toString()}`)
    return response
  }

  async getStore(id: string): Promise<Store> {
    // Backend returns Store directly (not wrapped in ApiResponse)
    const response = await api.get<Store>(`/stores/${id}`)
    return response
  }

  async createStore(data: CreateStoreData): Promise<CreateStoreResponse> {
    // Backend returns { store, apiKeys } structure
    const response = await api.post<CreateStoreResponse>('/stores', data)
    return response
  }

  async updateStore(id: string, data: UpdateStoreData): Promise<Store> {
    // Backend returns Store directly (not wrapped in ApiResponse)
    const response = await api.patch<Store>(`/stores/${id}`, data)
    return response
  }

  async deleteStore(id: string): Promise<void> {
    await api.delete(`/stores/${id}`)
  }

  async getStoreCurrencies(storeId: string): Promise<StoreCurrency[]> {
    // Backend returns array directly (not wrapped in ApiResponse)
    const response = await api.get<StoreCurrency[]>(`/stores/${storeId}/currencies`)
    return response
  }

  async getAvailableCurrencies(): Promise<Currency[]> {
    // Backend returns array directly (not wrapped in ApiResponse)
    const response = await api.get<Currency[]>('/currencies')
    return response
  }

  async addStoreCurrency(storeId: string, data: AddStoreCurrencyData): Promise<StoreCurrency> {
    // Backend only has PUT for upsert (create or update)
    const response = await api.put<StoreCurrency>(
      `/stores/${storeId}/currencies`,
      data
    )
    return response
  }

  // Backend only has PUT endpoint - no separate PATCH for update
  async updateStoreCurrency(
    storeId: string,
    currencyId: string,
    data: UpdateStoreCurrencyData
  ): Promise<StoreCurrency> {
    // Use PUT for upsert with currencyId
    const response = await api.put<StoreCurrency>(
      `/stores/${storeId}/currencies`,
      {
        currencyId,
        ...data
      }
    )
    return response
  }

  // Backend has no DELETE endpoint - disable currency instead
  async removeStoreCurrency(storeId: string, currencyId: string): Promise<StoreCurrency> {
    // To "delete", set isEnabled: false
    return this.updateStoreCurrency(storeId, currencyId, {
      isEnabled: false,
      minAmount: '0',
      maxAmount: '0'
    })
  }

  async configureCurrency(storeId: string, data: ConfigureCurrencyData): Promise<StoreCurrency> {
    // Backend uses PUT for upsert operation
    const response = await api.put<StoreCurrency>(
      `/stores/${storeId}/currencies`,
      {
        currencyId: data.currencyId,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled,
      }
    )
    return response
  }
}

export const storeService = new StoreService()
