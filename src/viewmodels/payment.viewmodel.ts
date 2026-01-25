import { create } from 'zustand'
import { invoiceService, type GenerateAddressData } from '@/services/invoice.service'
import { storeService } from '@/services/store.service'
import type { Invoice, StoreCurrency, InvoiceRate } from '@/models/types'

type PaymentStep = 'loading' | 'select_currency' | 'awaiting_payment' | 'confirming' | 'success' | 'expired' | 'error'

interface PaymentState {
  invoice: Invoice | null
  storeCurrencies: StoreCurrency[]
  selectedCurrency: StoreCurrency | null
  selectedRate: InvoiceRate | null  // Exchange rate for selected currency
  step: PaymentStep
  timeRemaining: number
  isLoading: boolean
  error: string | null
}

interface PaymentActions {
  initializePayment: (invoiceId: string) => Promise<void>
  selectCurrency: (currency: StoreCurrency) => Promise<void>
  generateAddress: (data: GenerateAddressData) => Promise<boolean>
  updateTimeRemaining: (seconds: number) => void
  setExpired: () => void
  clearError: () => void
  backToSelection: () => void
  reset: () => void
}

type PaymentViewModel = PaymentState & PaymentActions

const initialState: PaymentState = {
  invoice: null,
  storeCurrencies: [],
  selectedCurrency: null,
  selectedRate: null,
  step: 'loading',
  timeRemaining: 0,
  isLoading: false,
  error: null,
}

export const usePaymentViewModel = create<PaymentViewModel>((set, get) => ({
  ...initialState,

  initializePayment: async (invoiceId: string): Promise<void> => {
    const { invoice: currentInvoice, step } = get()
    // Only show loading if we haven't loaded the invoice yet
    if (!currentInvoice) {
      set({ isLoading: true, error: null, step: 'loading' })
    }

    try {
      const invoice = await invoiceService.getPublicInvoice(invoiceId)

      // Fetch store currencies first for all PENDING invoice states
      const storeCurrencies = await storeService.getStoreCurrencies(invoice.storeId)

      // Filter for enabled currencies with populated currency relation
      const enabledCurrencies = storeCurrencies.filter((sc) => sc.isEnabled && sc.currency)

      if (invoice.status === 'CONFIRMED') {
        set({ invoice, step: 'success', isLoading: false })
        return
      }

      if (invoice.status === 'EXPIRED') {
        set({ invoice, step: 'expired', isLoading: false })
        return
      }

      if (invoice.status === 'CONFIRMING' || invoice.status === 'DETECTED') {
        set({ invoice, step: 'confirming', isLoading: false })
        return
      }

      if (invoice.status === 'PENDING' && invoice.paymentAddress) {
        const expiresAt = invoice.expiresAt ? new Date(invoice.expiresAt).getTime() : 0
        const now = Date.now()
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000))

        if (timeRemaining === 0) {
          set({ invoice, step: 'expired', isLoading: false })
          return
        }

        // Don't update storeCurrencies during polling - prevents re-renders
        set({
          invoice,
          step: 'awaiting_payment',
          timeRemaining,
          isLoading: false,
        })
        return
      }

      // If address was already generated AND user hasn't explicitly gone back, stay on payment screen
      if (invoice.paymentAddress && get().selectedCurrency !== null) {
        const expiresAt = invoice.expiresAt ? new Date(invoice.expiresAt).getTime() : 0
        const now = Date.now()
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000))

        set({
          invoice,
          storeCurrencies: enabledCurrencies,
          step: 'awaiting_payment',
          timeRemaining,
          isLoading: false,
        })
        return
      }

      // If we are already selecting currency, only update data without resetting step
      if (get().step === 'select_currency') {
        set({
          invoice,
          storeCurrencies: enabledCurrencies,
          // Do not reset step or loading
        })
        return
      }

      // First load: set to select_currency
      set({
        invoice,
        storeCurrencies: enabledCurrencies,
        step: 'select_currency',
        isLoading: false,
      })
    } catch (err) {
      const error = err as { message?: string }
      set({
        error: error.message || 'Failed to load payment',
        step: 'error',
        isLoading: false,
      })
    }
  },

  selectCurrency: async (currency: StoreCurrency): Promise<void> => {
    const { invoice } = get()

    // Find the corresponding rate from invoice.rates[]
    let selectedRate: InvoiceRate | null = null
    if (invoice?.rates) {
      selectedRate = invoice.rates.find(
        (rate) =>
          rate.currencyId === currency.currencyId &&
          rate.networkId === currency.currency.network?.id
      ) || null
    }

    set({
      selectedCurrency: currency,
      selectedRate
    })
  },

  generateAddress: async (data: GenerateAddressData): Promise<boolean> => {
    const { invoice, selectedRate } = get()
    if (!invoice) {
      return false
    }

    set({ isLoading: true, error: null })
    try {
      // Generate payment address (backend returns {address, qrCode, token})
      const addressResponse = await invoiceService.generatePaymentAddress(invoice.id, data)

      // Backend returns: {address: {...}, qrCode, token}
      // The address field can be a string or an object with an 'address' property
      const paymentAddress = typeof addressResponse.address === 'string'
        ? addressResponse.address
        : addressResponse.address?.address

      // Merge the address data with the existing invoice
      const updatedInvoice = {
        ...invoice,
        paymentAddress,
        networkId: data.network,
        cryptoCurrency: data.token,
        // Store the crypto amount from selectedRate
        cryptoAmount: selectedRate?.payerAmount,
        // If backend returned more fields, merge them too
        ...(addressResponse.expiresAt && { expiresAt: addressResponse.expiresAt }),
      }

      const expiresAt = updatedInvoice.expiresAt
        ? new Date(updatedInvoice.expiresAt).getTime()
        : Date.now() + 15 * 60 * 1000
      const now = Date.now()
      const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000))

      set({
        invoice: updatedInvoice,
        step: 'awaiting_payment',
        timeRemaining,
        isLoading: false,
        // Keep selectedRate for displaying exchange rate
      })

      return true
    } catch (err) {
      const error = err as { message?: string }
      set({
        error: error.message || 'Failed to generate payment address',
        isLoading: false,
      })
      return false
    }
  },

  updateTimeRemaining: (seconds: number): void => {
    set({ timeRemaining: seconds })
    if (seconds <= 0) {
      set({ step: 'expired' })
    }
  },

  setExpired: (): void => {
    set({ step: 'expired', timeRemaining: 0 })
  },

  clearError: (): void => {
    set({ error: null })
  },

  backToSelection: (): void => {
    const { invoice, storeCurrencies } = get()
    set({
      selectedCurrency: null,
      selectedRate: null,
      step: 'select_currency',
    })
  },

  reset: (): void => {
    set(initialState)
  },
}))
