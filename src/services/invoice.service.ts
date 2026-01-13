import { api } from './api'
import type { Invoice, PaymentStatus, ApiResponse, PaginatedResponse } from '@/models/types'

export interface CreateInvoiceData {
  // Header
  store: string
  // Body (Mandatory)
  amount: string
  currency: string
  orderId: string
  title: string
  description: string
  fromReferralCode: string | null
  urlCallback: string
  urlSuccess: string
  urlReturn: string
  // Optional
  lifespan?: number
  isPaymentMultiple?: boolean
  accuracyPaymentPercent?: number
  additionalData?: Record<string, unknown>
}

export interface GenerateAddressData {
  token: string
  network: string
}

export interface InvoiceFilters {
  storeId?: string
  merchantId?: string
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function toAmountString(amount: number): string {
  return amount.toString()
}

export function fromAmountString(amount: string): number {
  return parseFloat(amount) || 0
}

class InvoiceService {
  async getInvoices(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    const params = new URLSearchParams()
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.merchantId) params.append('merchantId', filters.merchantId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(`/v1/invoice?${params.toString()}`)
    return response.data
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get<ApiResponse<Invoice>>(`/v1/invoice/${id}`)
    return response.data
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const { store, ...body } = data
    console.log('Creating invoice for store:', store)
    console.log('Creating invoice with body:', JSON.stringify(body, null, 2))

    const response = await api.post<ApiResponse<Invoice>>('/v1/invoice', body, {
      store,
    })
    return response.data
  }

  async generatePaymentAddress(invoiceId: string, data: GenerateAddressData): Promise<Invoice> {
    const response = await api.post<ApiResponse<Invoice>>(
      `/v1/invoice/${invoiceId}/address`,
      data
    )
    return response.data
  }

  async getPublicInvoice(id: string): Promise<Invoice> {
    const response = await api.get<ApiResponse<Invoice>>(`/v1/invoice/${id}`)
    return response.data
  }

  async getInvoiceTransactions(id: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/v1/invoice/${id}/transactions`)
    return response.data
  }
}

export const invoiceService = new InvoiceService()
