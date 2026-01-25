import { api } from './api'
import { CONFIG } from '@/lib/config'
import type { Invoice, PaymentStatus, ApiResponse, PaginatedResponse } from '@/models/types'

export interface CreateInvoiceData {
  // Required fields
  store: string
  amount: string
  currency: string
  orderId: string

  // Optional fields
  customerEmail?: string
  title?: string
  description?: string
  fromReferralCode?: string | null
  urlCallback?: string
  urlSuccess?: string
  urlReturn?: string
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

    // Make raw fetch to get full response structure (data + meta)
    const response = await fetch(`${CONFIG.API_URL}/v1/invoice?${params.toString()}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`)
    }

    const jsonData = await response.json()

    // Backend returns { success: true, data: Invoice[], meta: { total, page, limit, totalPages } }
    const invoices = jsonData.data || []
    const meta = jsonData.meta || { total: 0, page: 1, limit: 10, totalPages: 0 }

    return {
      data: invoices,
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: meta.totalPages
    }
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get<any>(`/v1/invoice/${id}`)
    const invoice = response.data || response

    // Map invoiceExchangeRates to rates if present
    if (invoice.invoiceExchangeRates) {
      invoice.rates = invoice.invoiceExchangeRates.map((rate: any) => ({
        currencyId: rate.currencyId,
        networkId: rate.currency?.network?.id || rate.currency?.networkId,
        rate: rate.rate,
        payerAmount: rate.payerAmount
      }))
    }

    // Map nested address object to flat paymentAddress property
    if (invoice.address?.address) {
      invoice.paymentAddress = invoice.address.address
    }

    return invoice
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const { store, ...body } = data
    const response = await api.post<any>(`/v1/invoice/${store}`, body)
    return response.data || response
  }

  async generatePaymentAddress(invoiceId: string, data: GenerateAddressData): Promise<Invoice> {
    const response = await api.post<any>(
      `/v1/invoice/${invoiceId}/address`,
      data
    )
    return response.data || response
  }

  async getPublicInvoice(id: string): Promise<Invoice> {
    const response = await api.get<any>(`/v1/invoice/${id}`)
    const invoice = response.data || response

    // Map invoiceExchangeRates to rates if present
    if (invoice.invoiceExchangeRates) {
      invoice.rates = invoice.invoiceExchangeRates.map((rate: any) => ({
        currencyId: rate.currencyId,
        networkId: rate.currency?.network?.id || rate.currency?.networkId,
        rate: rate.rate,
        payerAmount: rate.payerAmount
      }))
    }

    // Map nested address object to flat paymentAddress property
    if (invoice.address?.address) {
      invoice.paymentAddress = invoice.address.address
    }

    return invoice
  }

  async getInvoiceTransactions(id: string): Promise<any[]> {
    // Backend returns { transactions } wrapper
    const response = await api.get<{ transactions: any[] }>(`/v1/invoice/${id}/transactions`)
    return response.transactions
  }
}

export const invoiceService = new InvoiceService()
