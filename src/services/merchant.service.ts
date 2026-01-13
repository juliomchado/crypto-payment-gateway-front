import { api } from './api'
import type { Merchant, ApiResponse, MerchantStatus } from '@/models/types'

export interface CreateMerchantData {
  merchantName: string
  businessType?: string
  registrationNumber?: string
  taxId?: string
}

export interface UpdateMerchantData {
  merchantName?: string
  businessType?: string
  registrationNumber?: string
  taxId?: string
}

export interface ListMerchantsQuery {
  skip?: number
  take?: number
  isActive?: boolean
}

class MerchantService {
  async getMerchants(query?: ListMerchantsQuery): Promise<Merchant[]> {
    const params = new URLSearchParams()
    if (query?.skip) params.append('skip', query.skip.toString())
    if (query?.take) params.append('take', query.take.toString())
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString())

    interface BackendListResponse {
      merchants: (Merchant & { name?: string })[]
    }
    const response = await api.get<ApiResponse<BackendListResponse>>(`/merchants?${params.toString()}`)
    const items = response.data.merchants || []

    return items.map(m => ({
      ...m,
      merchantName: m.merchantName || m.name
    })) as Merchant[]
  }

  async getMerchant(id: string): Promise<Merchant> {
    const response = await api.get<ApiResponse<Merchant & { name?: string }>>(`/merchants/${id}`)
    const merchant = response.data
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async getCurrent(): Promise<Merchant | null> {
    interface BackendListResponse {
      merchants: (Merchant & { name?: string })[]
    }
    const response = await api.get<ApiResponse<BackendListResponse>>('/merchants')
    const merchants = response.data.merchants

    if (!merchants || merchants.length === 0) {
      return null
    }

    const merchant = merchants[0]
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async createMerchant(data: CreateMerchantData): Promise<Merchant> {
    const response = await api.post<ApiResponse<Merchant & { name?: string }>>('/merchants', data)
    const merchant = response.data
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async updateMerchant(id: string, data: UpdateMerchantData): Promise<Merchant> {
    const response = await api.patch<ApiResponse<Merchant & { name?: string }>>(`/merchants/${id}`, data)
    const merchant = response.data
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async deleteMerchant(id: string): Promise<void> {
    await api.delete(`/merchants/${id}`)
  }

  async updateMerchantStatus(id: string, status: MerchantStatus): Promise<Merchant> {
    const response = await api.patch<ApiResponse<Merchant & { name?: string }>>(`/merchants/${id}/status`, { status })
    const merchant = response.data
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }
}

export const merchantService = new MerchantService()
