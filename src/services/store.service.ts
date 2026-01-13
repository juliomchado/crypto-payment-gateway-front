import { api } from './api'
import type { Store, StoreCurrency, Currency, ApiResponse, PaginatedResponse, StoreStatus } from '@/models/types'

export interface CreateStoreData {
  name: string
  slug: string
  merchantId: string
  exchangeRateSourceId: string
  description?: string
  status?: StoreStatus
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
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
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.merchantId) params.append('merchantId', query.merchantId)
    if (query?.status) params.append('status', query.status)

    const response = await api.get<ApiResponse<Store[]>>(`/stores?${params.toString()}`)
    return response.data
  }

  async getStore(id: string): Promise<Store> {
    const response = await api.get<ApiResponse<Store>>(`/stores/${id}`)
    return response.data
  }

  async createStore(data: CreateStoreData): Promise<Store> {
    const response = await api.post<ApiResponse<Store>>('/stores', data)
    return response.data
  }

  async updateStore(id: string, data: UpdateStoreData): Promise<Store> {
    const response = await api.patch<ApiResponse<Store>>(`/stores/${id}`, data)
    return response.data
  }

  async deleteStore(id: string): Promise<void> {
    await api.delete(`/stores/${id}`)
  }

  async getStoreCurrencies(storeId: string): Promise<StoreCurrency[]> {
    const response = await api.get<ApiResponse<StoreCurrency[]>>(`/stores/${storeId}/currencies`)
    return response.data
  }

  async getAvailableCurrencies(): Promise<Currency[]> {
    const response = await api.get<ApiResponse<Currency[]>>('/currencies')
    return response.data
  }

  async addStoreCurrency(storeId: string, data: AddStoreCurrencyData): Promise<StoreCurrency> {
    const response = await api.put<ApiResponse<StoreCurrency>>(
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
    const response = await api.patch<ApiResponse<StoreCurrency>>(
      `/stores/${storeId}/currencies/${currencyId}`,
      data
    )
    return response.data
  }

  async removeStoreCurrency(storeId: string, currencyId: string): Promise<void> {
    await api.delete(`/stores/${storeId}/currencies/${currencyId}`)
  }

  async configureCurrency(storeId: string, data: ConfigureCurrencyData): Promise<StoreCurrency> {
    const response = await api.put<ApiResponse<StoreCurrency>>(
      `/stores/${storeId}/currencies`,
      {
        currencyId: data.currencyId,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isEnabled: data.isEnabled,
      }
    )
    return response.data
  }
}

export const storeService = new StoreService()
