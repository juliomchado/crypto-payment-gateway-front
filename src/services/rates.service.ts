import { api } from './api'
import type { ApiResponse } from '@/models/types'

export interface ExchangeRate {
  currency: string
  rate: number
  source: string
}

export interface RatesResponse {
  baseCurrency: string
  timestamp: string
  rates: ExchangeRate[]
}

class RatesService {
  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    const response = await this.getRates(base, [quote])
    return response.rates[0]
  }

  async getRates(base: string, quotes: string[]): Promise<RatesResponse> {
    const quoteParam = quotes.join(',')
    const response = await api.get<ApiResponse<RatesResponse>>(
      `/rates?base=${base}&quote=${quoteParam}`
    )
    return response.data
  }

  async getMultipleRates(pairs: Array<{ from: string; to: string }>): Promise<ExchangeRate[]> {
    const grouped = new Map<string, string[]>()
    for (const pair of pairs) {
      const quotes = grouped.get(pair.from) || []
      quotes.push(pair.to)
      grouped.set(pair.from, quotes)
    }

    const results: ExchangeRate[] = []
    for (const [base, quotes] of Array.from(grouped.entries())) {
      const response = await this.getRates(base, quotes)
      results.push(...response.rates)
    }

    return results
  }
}

export const ratesService = new RatesService()
