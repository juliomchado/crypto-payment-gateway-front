'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { CurrencyConfig } from '@/components/stores/currency-config'

export default function StoreCurrenciesPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const { toast } = useToast()

  const {
    selectedStore,
    storeCurrencies,
    availableCurrencies,
    isLoading,
    error,
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

  const handleConfigure = async (data: {
    currencyId: string
    minAmount: string
    maxAmount: string
    isEnabled: boolean
  }) => {
    const success = await configureCurrency(storeId, data)

    if (success) {
      // Refetch to get updated data with relations
      await fetchStoreCurrencies(storeId)

      toast({
        title: 'Currency configured',
        description: 'The currency settings have been updated.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'Failed to configure currency. Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {selectedStore ? selectedStore.name : 'Store'} - Currencies
          </h1>
          <p className="text-muted-foreground">
            Manage which cryptocurrencies this store accepts as payment
          </p>
        </div>
      </div>

      <CurrencyConfig
        storeCurrencies={storeCurrencies}
        availableCurrencies={availableCurrencies}
        onConfigure={handleConfigure}
        isLoading={isLoading}
      />
    </div>
  )
}
