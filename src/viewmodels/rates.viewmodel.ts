import { create } from 'zustand'
import { ratesService, type ExchangeRate } from '@/services/rates.service'

interface RatesState {
  rates: Record<string, ExchangeRate>
  isLoading: boolean
  error: string | null
  lastUpdate: string | null
}

interface RatesActions {
  fetchRate: (from: string, to: string) => Promise<void>
  fetchMultipleRates: (pairs: Array<{ from: string; to: string }>) => Promise<void>
  startAutoRefresh: (pairs: Array<{ from: string; to: string }>, intervalMs?: number) => () => void
  clearError: () => void
}

type RatesViewModel = RatesState & RatesActions

export const useRatesViewModel = create<RatesViewModel>((set, get) => ({
  rates: {},
  isLoading: false,
  error: null,
  lastUpdate: null,

  fetchRate: async (from: string, to: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const rate = await ratesService.getRate(from, to)
      const key = `${from}-${to}`
      set((state) => ({
        rates: { ...state.rates, [key]: rate },
        isLoading: false,
        lastUpdate: new Date().toISOString(),
      }))
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch exchange rate', isLoading: false })
    }
  },

  fetchMultipleRates: async (pairs: Array<{ from: string; to: string }>): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const rates = await ratesService.getMultipleRates(pairs)
      const ratesMap: Record<string, ExchangeRate> = {}
      rates.forEach((rate) => {
        // rate.currency is the quote currency (e.g., "BTC", "ETH")
        // We need to reconstruct the pair key based on the request
        // For now, use currency as the key (works for single base currency)
        const key = rate.currency
        ratesMap[key] = rate
      })
      set({
        rates: ratesMap,
        isLoading: false,
        lastUpdate: new Date().toISOString(),
      })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch exchange rates', isLoading: false })
    }
  },

  startAutoRefresh: (
    pairs: Array<{ from: string; to: string }>,
    intervalMs: number = 60000
  ): (() => void) => {
    const { fetchMultipleRates } = get()

    // Initial fetch
    fetchMultipleRates(pairs)

    // Auto-refresh every intervalMs (default 60 seconds)
    const intervalId = setInterval(() => {
      fetchMultipleRates(pairs)
    }, intervalMs)

    // Return cleanup function
    return () => clearInterval(intervalId)
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
