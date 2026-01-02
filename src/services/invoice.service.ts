import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_INVOICES, MOCK_CURRENCIES } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Invoice, InvoiceStatus, ApiResponse, PaginatedResponse } from '@/models/types'

export interface CreateInvoiceData {
  storeId: string
  amount: number
  currency: string
  orderId: string
  customerEmail?: string
  metadata?: Record<string, unknown>
}

export interface GenerateAddressData {
  token: string
  network: string
}

export interface InvoiceFilters {
  storeId?: string
  status?: InvoiceStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

class InvoiceService {
  private mockInvoices = [...MOCK_INVOICES]

  async getInvoices(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      let filtered = [...this.mockInvoices]

      if (filters?.storeId) {
        filtered = filtered.filter((inv) => inv.storeId === filters.storeId)
      }
      if (filters?.status) {
        filtered = filtered.filter((inv) => inv.status === filters.status)
      }

      const page = filters?.page || 1
      const limit = filters?.limit || 10
      const start = (page - 1) * limit
      const end = start + limit

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      }
    }

    const params = new URLSearchParams()
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    return api.get<PaginatedResponse<Invoice>>(`/invoices?${params.toString()}`)
  }

  async getInvoice(id: string): Promise<Invoice> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const invoice = this.mockInvoices.find((inv) => inv.id === id)
      if (!invoice) {
        throw { message: 'Invoice not found', statusCode: 404 }
      }
      return invoice
    }
    const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`)
    return response.data
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const newInvoice: Invoice = {
        id: generateId(),
        storeId: data.storeId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        customerEmail: data.customerEmail,
        metadata: data.metadata,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockInvoices.unshift(newInvoice)
      return newInvoice
    }
    const response = await api.post<ApiResponse<Invoice>>('/v1/invoice', data)
    return response.data
  }

  async generatePaymentAddress(invoiceId: string, data: GenerateAddressData): Promise<Invoice> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockInvoices.findIndex((inv) => inv.id === invoiceId)
      if (index === -1) {
        throw { message: 'Invoice not found', statusCode: 404 }
      }

      const currency = MOCK_CURRENCIES.find(
        (c) => c.symbol === data.token && c.network === data.network
      )

      const mockAddresses: Record<string, string> = {
        ethereum: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        bsc: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        solana: Array.from({ length: 44 }, () =>
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join(''),
      }

      this.mockInvoices[index] = {
        ...this.mockInvoices[index],
        status: 'AWAITING_PAYMENT',
        cryptoCurrency: data.token,
        cryptoAmount: this.mockInvoices[index].amount,
        network: data.network,
        paymentAddress: mockAddresses[data.network] || mockAddresses.ethereum,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return this.mockInvoices[index]
    }
    const response = await api.post<ApiResponse<Invoice>>(
      `/v1/invoice/${invoiceId}/address`,
      data
    )
    return response.data
  }

  async getPublicInvoice(id: string): Promise<Invoice> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const invoice = this.mockInvoices.find((inv) => inv.id === id)
      if (!invoice) {
        throw { message: 'Invoice not found', statusCode: 404 }
      }
      return invoice
    }
    const response = await api.get<ApiResponse<Invoice>>(`/v1/invoice/${id}`)
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const invoiceService = new InvoiceService()
