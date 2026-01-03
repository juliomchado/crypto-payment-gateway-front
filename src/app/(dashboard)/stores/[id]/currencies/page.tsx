'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyConfig } from '@/components/stores/currency-config'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useToast } from '@/hooks/use-toast'

export default function StoreCurrenciesPage() {
  const params = useParams()
  const storeId = params.id as string
  const { toast } = useToast()

  const {
    selectedStore,
    storeCurrencies,
    availableCurrencies,
    isLoading,
    fetchStore,
    fetchStoreCurrencies,
    fetchAvailableCurrencies,
    configureCurrency,
  } = useStoreViewModel()

  useEffect(() => {
    fetchStore(storeId)
    fetchStoreCurrencies(storeId)
    fetchAvailableCurrencies()
  }, [storeId, fetchStore, fetchStoreCurrencies, fetchAvailableCurrencies])

  const handleConfigureCurrency = async (data: {
    currencyId: string
    minAmount: number
    maxAmount: number
    isEnabled: boolean
  }) => {
    const success = await configureCurrency(storeId, data)
    if (success) {
      toast({
        title: 'Currency configured',
        description: 'Payment currency has been updated.',
      })
    }
  }

  if (isLoading && !selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/stores/${storeId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {selectedStore?.name || 'Store'} - Currencies
          </h1>
          <p className="text-muted-foreground">
            Configure accepted payment currencies
          </p>
        </div>
      </div>

      <CurrencyConfig
        storeCurrencies={storeCurrencies}
        availableCurrencies={availableCurrencies}
        onConfigure={handleConfigureCurrency}
        isLoading={isLoading}
      />
    </div>
  )
}
