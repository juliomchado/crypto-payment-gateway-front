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
  status?: MerchantStatus  // Changed from isActive to status enum
}

class MerchantService {
  async getMerchants(query?: ListMerchantsQuery): Promise<Merchant[]> {
    const params = new URLSearchParams()
    if (query?.skip) params.append('skip', query.skip.toString())
    if (query?.take) params.append('take', query.take.toString())
    // Backend uses status parameter with MerchantStatus enum values
    if (query?.status) params.append('status', query.status)

    // Backend returns { merchants, total } structure directly
    interface BackendListResponse {
      merchants: (Merchant & { name?: string })[]
      total: number
    }
    const response = await api.get<BackendListResponse>(`/merchants?${params.toString()}`)
    const items = response.merchants || []

    return items.map(m => ({
      ...m,
      merchantName: m.merchantName || m.name
    })) as Merchant[]
  }

  async getMerchant(id: string): Promise<Merchant> {
    // Backend returns Merchant directly (not wrapped in ApiResponse)
    const merchant = await api.get<Merchant & { name?: string }>(`/merchants/${id}`)
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async getCurrent(): Promise<Merchant | null> {
    // Backend returns { merchants, total } structure directly
    interface BackendListResponse {
      merchants: (Merchant & { name?: string })[]
      total: number
    }
    const response = await api.get<BackendListResponse>('/merchants')
    const merchants = response.merchants

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
    // Backend returns Merchant directly (not wrapped in ApiResponse)
    const merchant = await api.post<Merchant & { name?: string }>('/merchants', data)
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async updateMerchant(id: string, data: UpdateMerchantData): Promise<Merchant> {
    // Backend returns Merchant directly (not wrapped in ApiResponse)
    const merchant = await api.patch<Merchant & { name?: string }>(`/merchants/${id}`, data)
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }

  async deleteMerchant(id: string): Promise<void> {
    await api.delete(`/merchants/${id}`)
  }

  async updateMerchantStatus(id: string, status: MerchantStatus): Promise<Merchant> {
    // Backend returns Merchant directly (not wrapped in ApiResponse)
    const merchant = await api.patch<Merchant & { name?: string }>(`/merchants/${id}/status`, { status })
    return {
      ...merchant,
      merchantName: merchant.merchantName || merchant.name
    } as Merchant
  }
}

export const merchantService = new MerchantService()
