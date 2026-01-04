import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
  const handleValueChange = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    if (currency) {
      onSelect(currency)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="currency-select">Select Currency</Label>
      <Select
        value={selectedCurrency?.id || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger id="currency-select" className="w-full">
          <SelectValue placeholder="Choose a currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((sc) => (
            <SelectItem key={sc.id} value={sc.id}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">
                  {sc.currency.symbol}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">{sc.currency.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {NETWORK_NAMES[sc.currency.network] || sc.currency.network}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
