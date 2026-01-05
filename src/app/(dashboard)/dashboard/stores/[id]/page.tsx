'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Store, Key, ArrowLeft, Settings, Edit, Globe, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function StoreDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const storeId = params.id as string
  const { stores, fetchStores } = useStoreViewModel()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStore = async () => {
      setIsLoading(true)
      await fetchStores()
      setIsLoading(false)
    }
    loadStore()
  }, [fetchStores, storeId])

  const store = stores.find(s => s.id === storeId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Store not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/stores')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{store.name}</h1>
              <Badge variant={store.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {store.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {store.description || 'No description'}
            </p>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(store.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/stores/${store.id}/currencies`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Currencies
            </Button>
          </Link>
          <Link href={`/dashboard/api-keys?store=${store.id}`}>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              API Keys
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.invoiceCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Structure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.feePercent}%
              {store.feeFixed > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {' + '}{formatCurrency(store.feeFixed, store.feeCurrency || 'USD')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Window</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.defaultPaymentWindow ? Math.round(store.defaultPaymentWindow / 60) : 60} min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic store configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Store ID:</span>
              <span className="col-span-2 text-sm font-mono">{store.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Slug:</span>
              <span className="col-span-2 text-sm font-mono">{store.slug}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Default Currency:</span>
              <span className="col-span-2 text-sm">{store.defaultCurrency || 'Not set'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Payment Window:</span>
              <span className="col-span-2 text-sm">
                {store.defaultPaymentWindow ? `${store.defaultPaymentWindow}s` : 'Not set'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Globe className="inline-block mr-2 h-5 w-5" />
              Webhook URLs
            </CardTitle>
            <CardDescription>Configure callback endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Callback URL:</span>
              <p className="text-sm break-all font-mono bg-muted p-2 rounded">
                {store.urlCallback || 'Not configured'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Return URL:</span>
              <p className="text-sm break-all font-mono bg-muted p-2 rounded">
                {store.urlReturn || 'Not configured'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Success URL:</span>
              <p className="text-sm break-all font-mono bg-muted p-2 rounded">
                {store.urlSuccess || 'Not configured'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Configuration</CardTitle>
          <CardDescription>Transaction fees for this store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Percentage Fee:</span>
              <p className="text-2xl font-bold">{store.feePercent || 0}%</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Fixed Fee:</span>
              <p className="text-2xl font-bold">
                {store.feeFixed && store.feeFixed > 0
                  ? formatCurrency(store.feeFixed, store.feeCurrency || 'USD')
                  : 'None'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Fee Currency:</span>
              <p className="text-2xl font-bold">{store.feeCurrency || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage store settings and features</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href={`/dashboard/stores/${store.id}/currencies`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure Currencies
            </Button>
          </Link>
          <Link href={`/dashboard/api-keys?store=${store.id}`}>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Manage API Keys
            </Button>
          </Link>
          <Link href={`/dashboard/webhooks?store=${store.id}`}>
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              View Webhooks
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
