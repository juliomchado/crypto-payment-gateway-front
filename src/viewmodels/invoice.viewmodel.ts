import { create } from 'zustand'
import {
  invoiceService,
  type CreateInvoiceData,
  type GenerateAddressData,
  type InvoiceFilters,
} from '@/services/invoice.service'
import type { Invoice, PaymentStatus } from '@/models/types'

interface InvoiceState {
  invoices: Invoice[]
  selectedInvoice: Invoice | null
  transactions: any[]
  totalInvoices: number
  currentPage: number
  totalPages: number
  filters: InvoiceFilters
  isLoading: boolean
  error: string | null
}

interface InvoiceActions {
  fetchInvoices: (filters?: InvoiceFilters) => Promise<void>
  fetchInvoice: (id: string) => Promise<void>
  fetchInvoiceTransactions: (id: string) => Promise<void>
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice | null>
  generatePaymentAddress: (invoiceId: string, data: GenerateAddressData) => Promise<Invoice | null>
  setFilters: (filters: Partial<InvoiceFilters>) => void
  setPage: (page: number) => void
  selectInvoice: (invoice: Invoice | null) => void
  clearError: () => void
}

type InvoiceViewModel = InvoiceState & InvoiceActions

export const useInvoiceViewModel = create<InvoiceViewModel>((set, get) => ({
  invoices: [],
  selectedInvoice: null,
  transactions: [],
  totalInvoices: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {},
  isLoading: false,
  error: null,

  fetchInvoices: async (filters?: InvoiceFilters): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const mergedFilters = { ...get().filters, ...filters }
      const response = await invoiceService.getInvoices(mergedFilters)
      set({
        invoices: Array.isArray(response?.data) ? response.data : [],
        totalInvoices: response?.total || 0,
        currentPage: response?.page || 1,
        totalPages: response?.totalPages || 1,
        filters: mergedFilters,
        isLoading: false,
      })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch invoices', isLoading: false })
    }
  },

  fetchInvoice: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const invoice = await invoiceService.getInvoice(id)
      set({ selectedInvoice: invoice, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch invoice', isLoading: false })
    }
  },

  fetchInvoiceTransactions: async (id: string): Promise<void> => {
    try {
      const transactions = await invoiceService.getInvoiceTransactions(id)
      set({ transactions })
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      set({ transactions: [] })
    }
  },

  createInvoice: async (data: CreateInvoiceData): Promise<Invoice | null> => {
    set({ isLoading: true, error: null })
    try {
      const invoice = await invoiceService.createInvoice(data)
      set((state) => ({
        invoices: [invoice, ...state.invoices],
        totalInvoices: state.totalInvoices + 1,
        isLoading: false,
      }))
      return invoice
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to create invoice', isLoading: false })
      return null
    }
  },

  generatePaymentAddress: async (
    invoiceId: string,
    data: GenerateAddressData
  ): Promise<Invoice | null> => {
    set({ isLoading: true, error: null })
    try {
      const invoice = await invoiceService.generatePaymentAddress(invoiceId, data)
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === invoiceId ? invoice : inv)),
        selectedInvoice: state.selectedInvoice?.id === invoiceId ? invoice : state.selectedInvoice,
        isLoading: false,
      }))
      return invoice
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to generate payment address', isLoading: false })
      return null
    }
  },

  setFilters: (filters: Partial<InvoiceFilters>): void => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  setPage: (page: number): void => {
    get().fetchInvoices({ page })
  },

  selectInvoice: (invoice: Invoice | null): void => {
    set({ selectedInvoice: invoice })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
