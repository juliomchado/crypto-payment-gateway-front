'use client'

import { useEffect } from 'react'
import { useRatesViewModel } from '@/viewmodels/rates.viewmodel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const CRYPTO_PAIRS = [
  { from: 'BTC', to: 'USD', label: 'Bitcoin' },
  { from: 'ETH', to: 'USD', label: 'Ethereum' },
  { from: 'USDT', to: 'USD', label: 'Tether' },
  { from: 'SOL', to: 'USD', label: 'Solana' },
]

export function ExchangeRatesWidget() {
  const { rates, lastUpdate, fetchMultipleRates, startAutoRefresh, isLoading } = useRatesViewModel()

  useEffect(() => {
    // Start auto-refresh every 60 seconds
    const cleanup = startAutoRefresh(CRYPTO_PAIRS, 60000)
    return cleanup
  }, [startAutoRefresh])

  const handleRefresh = () => {
    fetchMultipleRates(CRYPTO_PAIRS)
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-medium">Exchange Rates</CardTitle>
          <CardDescription className="text-xs">
            Live cryptocurrency prices
          </CardDescription>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {CRYPTO_PAIRS.map((pair) => {
          const key = `${pair.from}-${pair.to}`
          const rate = rates[key]

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                  {pair.from.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{pair.label}</p>
                  <p className="text-xs text-muted-foreground">{pair.from}</p>
                </div>
              </div>
              <div className="text-right">
                {rate ? (
                  <p className="text-sm font-medium">
                    {formatCurrency(rate.rate, pair.to)}
                  </p>
                ) : (
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                )}
              </div>
            </div>
          )
        })}

        {lastUpdate && (
          <p className="text-xs text-center text-muted-foreground pt-2 border-t">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
