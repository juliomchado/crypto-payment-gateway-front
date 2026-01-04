'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NETWORK_NAMES } from '@/models/mock-data'
import type { StoreCurrency, Currency } from '@/models/types'

const currencyConfigSchema = z.object({
  currencyId: z.string().min(1, 'Please select a currency'),
  minAmount: z.number().min(0, 'Min amount must be positive'),
  maxAmount: z.number().min(0, 'Max amount must be positive'),
  isEnabled: z.boolean(),
})

type CurrencyConfigFormData = z.infer<typeof currencyConfigSchema>

interface CurrencyConfigProps {
  storeCurrencies: StoreCurrency[]
  availableCurrencies: Currency[]
  onConfigure: (data: CurrencyConfigFormData) => Promise<void>
  isLoading?: boolean
}

export function CurrencyConfig({
  storeCurrencies,
  availableCurrencies,
  onConfigure,
  isLoading,
}: CurrencyConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<StoreCurrency | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CurrencyConfigFormData>({
    resolver: zodResolver(currencyConfigSchema),
    defaultValues: {
      isEnabled: true,
      minAmount: 10,
      maxAmount: 10000,
    },
  })

  const selectedCurrencyId = watch('currencyId')
  const isEnabled = watch('isEnabled')

  const openAddDialog = () => {
    reset({
      currencyId: '',
      minAmount: 10,
      maxAmount: 10000,
      isEnabled: true,
    })
    setEditingCurrency(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (storeCurrency: StoreCurrency) => {
    reset({
      currencyId: storeCurrency.currencyId,
      minAmount: storeCurrency.minAmount,
      maxAmount: storeCurrency.maxAmount,
      isEnabled: storeCurrency.isEnabled,
    })
    setEditingCurrency(storeCurrency)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (data: CurrencyConfigFormData) => {
    await onConfigure(data)
    setIsDialogOpen(false)
    reset()
  }

  const configuredCurrencyIds = storeCurrencies.map((sc) => sc.currencyId)
  const unconfiguredCurrencies = availableCurrencies.filter(
    (c) => !configuredCurrencyIds.includes(c.id)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment Currencies</h3>
          <p className="text-sm text-muted-foreground">
            Configure which cryptocurrencies this store accepts
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={unconfiguredCurrencies.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Currency
        </Button>
      </div>

      {storeCurrencies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No currencies configured yet</p>
            <Button className="mt-4" onClick={openAddDialog}>
              Add your first currency
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {storeCurrencies.map((sc) => (
            <Card
              key={sc.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${!sc.isEnabled ? 'opacity-60' : ''
                }`}
              onClick={() => openEditDialog(sc)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {sc.currency.symbol}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {NETWORK_NAMES[sc.currency.network] || sc.currency.network}
                    </span>
                  </CardTitle>
                  <Switch checked={sc.isEnabled} disabled />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Min: ${sc.minAmount}</p>
                  <p>Max: ${sc.maxAmount}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCurrency ? 'Edit Currency' : 'Add Currency'}
            </DialogTitle>
            <DialogDescription>
              Configure the payment settings for this cryptocurrency.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                {editingCurrency ? (
                  <Input
                    value={`${editingCurrency.currency.symbol} (${NETWORK_NAMES[editingCurrency.currency.network] ||
                      editingCurrency.currency.network
                      })`}
                    disabled
                  />
                ) : (
                  <Select
                    value={selectedCurrencyId || ''}
                    onValueChange={(value) => setValue('currencyId', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {unconfiguredCurrencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.symbol} -{' '}
                          {NETWORK_NAMES[currency.network] || currency.network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.currencyId && (
                  <p className="text-sm text-destructive">{errors.currencyId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount ($)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    {...register('minAmount', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.minAmount && (
                    <p className="text-sm text-destructive">{errors.minAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount ($)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    step="0.01"
                    {...register('maxAmount', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.maxAmount && (
                    <p className="text-sm text-destructive">{errors.maxAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isEnabled">Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments in this currency
                  </p>
                </div>
                <Switch
                  id="isEnabled"
                  checked={isEnabled}
                  onCheckedChange={(checked) => setValue('isEnabled', checked)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCurrency ? 'Save Changes' : 'Add Currency'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
