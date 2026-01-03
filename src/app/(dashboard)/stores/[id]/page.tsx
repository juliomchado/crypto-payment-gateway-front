'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store, Settings, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrencyConfig } from '@/components/stores/currency-config'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
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
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    )
  }

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Store not found</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/stores')}>
          Back to Stores
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/stores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{selectedStore.name}</h1>
          <p className="text-muted-foreground">
            Manage store settings and payment options
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <Store className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="currencies">
            <Settings className="mr-2 h-4 w-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={selectedStore.isActive ? 'success' : 'secondary'}>
                    {selectedStore.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-medium">{selectedStore.invoiceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(selectedStore.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Store ID</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {selectedStore.id}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Configured Currencies</span>
                  <span className="font-medium">{storeCurrencies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Currencies</span>
                  <span className="font-medium">
                    {storeCurrencies.filter((sc) => sc.isEnabled).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="currencies">
          <CurrencyConfig
            storeCurrencies={storeCurrencies}
            availableCurrencies={availableCurrencies}
            onConfigure={handleConfigureCurrency}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Key className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Manage API keys for this store
              </p>
              <Link href={`/dashboard/api-keys?store=${storeId}`}>
                <Button className="mt-4">Go to API Keys</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
