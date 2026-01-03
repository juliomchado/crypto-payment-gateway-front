import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { NETWORK_NAMES } from '@/models/mock-data'
import type { StoreCurrency } from '@/models/types'

interface CurrencySelectorProps {
  currencies: StoreCurrency[]
  selectedCurrency: StoreCurrency | null
  onSelect: (currency: StoreCurrency) => void
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
}: CurrencySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {currencies.map((sc) => (
        <Card
          key={sc.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            selectedCurrency?.id === sc.id &&
              'border-primary bg-primary/5 shadow-md'
          )}
          onClick={() => onSelect(sc)}
        >
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="text-2xl font-bold text-primary">
              {sc.currency.symbol}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {NETWORK_NAMES[sc.currency.network]?.split(' ')[0] ||
                sc.currency.network}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
