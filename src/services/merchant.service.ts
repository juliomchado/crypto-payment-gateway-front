import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_MERCHANT } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Merchant, ApiResponse, MerchantStatus } from '@/models/types'

// Request DTOs matching backend API
export interface CreateMerchantData {
  merchantName: string            // 2-100 characters
  businessType?: string           // Type of business
  registrationNumber?: string     // Business registration number
  taxId?: string                  // Tax ID/CNPJ/EIN (optional)
}

export interface UpdateMerchantData {
  merchantName?: string           // 2-100 characters
  businessType?: string
  registrationNumber?: string
  taxId?: string
}

export interface ListMerchantsQuery {
  skip?: number                   // Default: 0
  take?: number                   // 1-100, default: 20
  isActive?: boolean
}

class MerchantService {
  private mockMerchant: Merchant = { ...MOCK_MERCHANT }

  async getMerchants(query?: ListMerchantsQuery): Promise<Merchant[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      // In mock mode, user has only one merchant
      const merchants = [this.mockMerchant]

      if (query?.isActive !== undefined) {
        // Filter by active status - APPROVED is considered active
        return merchants.filter(m => query.isActive ? m.status === 'APPROVED' : m.status !== 'APPROVED')
      }

      return merchants
    }

    const params = new URLSearchParams()
    if (query?.skip) params.append('skip', query.skip.toString())
    if (query?.take) params.append('take', query.take.toString())
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString())

    const response = await api.get<ApiResponse<Merchant[]>>(`/merchants?${params.toString()}`)
    return response.data
  }

  async getMerchant(id: string): Promise<Merchant> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      if (this.mockMerchant.id === id) {
        return this.mockMerchant
      }
      throw { message: 'Merchant not found', statusCode: 404 }
    }

    const response = await api.get<ApiResponse<Merchant>>(`/merchants/${id}`)
    return response.data
  }

  async getCurrentMerchant(): Promise<Merchant> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return this.mockMerchant
    }

    // Get merchants for current user and return the first one
    const response = await api.get<ApiResponse<Merchant[]>>('/merchants')
    if (response.data.length === 0) {
      throw { message: 'No merchant found for current user', statusCode: 404 }
    }
    return response.data[0]
  }

  async createMerchant(data: CreateMerchantData): Promise<Merchant> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const newMerchant: Merchant = {
        id: generateId(),
        userId: 'mock-user-id',
        merchantName: data.merchantName,
        businessType: data.businessType,
        registrationNumber: data.registrationNumber,
        taxId: data.taxId,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this.mockMerchant = newMerchant
      return newMerchant
    }

    const response = await api.post<ApiResponse<Merchant>>('/merchants', data)
    return response.data
  }

  async updateMerchant(id: string, data: UpdateMerchantData): Promise<Merchant> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      if (this.mockMerchant.id !== id) {
        throw { message: 'Merchant not found', statusCode: 404 }
      }

      this.mockMerchant = {
        ...this.mockMerchant,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return this.mockMerchant
    }

    const response = await api.patch<ApiResponse<Merchant>>(`/merchants/${id}`, data)
    return response.data
  }

  async deleteMerchant(id: string): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      if (this.mockMerchant.id !== id) {
        throw { message: 'Merchant not found', statusCode: 404 }
      }

      // Backend typically archives instead of deleting
      this.mockMerchant.status = 'ARCHIVED'
      return
    }

    await api.delete(`/merchants/${id}`)
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const merchantService = new MerchantService()
