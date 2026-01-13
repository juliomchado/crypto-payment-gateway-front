'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import type { Currency } from '@/models/types'

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
    fetchStore,
    fetchStoreCurrencies,
    fetchAvailableCurrencies,
    addStoreCurrency,
    removeStoreCurrency,
  } = useStoreViewModel()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('0.01')
  const [maxAmount, setMaxAmount] = useState<string>('10000')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchStore(storeId)
    fetchStoreCurrencies(storeId)
    fetchAvailableCurrencies()
  }, [storeId, fetchStore, fetchStoreCurrencies, fetchAvailableCurrencies])

  // Filter out currencies already added to the store
  const availableToAdd = availableCurrencies.filter(
    (currency) => !Array.isArray(storeCurrencies) || !storeCurrencies.some((sc) => sc.currencyId === currency.id)
  )

  const handleAddCurrency = async () => {
    if (!selectedCurrencyId) return

    setIsSubmitting(true)
    const success = await addStoreCurrency(storeId, selectedCurrencyId, minAmount, maxAmount)
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'Currency added',
        description: 'The currency has been added to your store.',
      })
      setIsAddDialogOpen(false)
      setSelectedCurrencyId('')
      setMinAmount('0.01')
      setMaxAmount('10000')
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add currency. Please try again.',
      })
    }
  }

  const handleRemoveCurrency = async (currencyId: string) => {
    const success = await removeStoreCurrency(storeId, currencyId)
    if (success) {
      toast({
        title: 'Currency removed',
        description: 'The currency has been removed from your store.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove currency. Please try again.',
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Currency
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accepted Currencies</CardTitle>
          <CardDescription>
            Cryptocurrencies that customers can use to pay at this store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !Array.isArray(storeCurrencies) || storeCurrencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <p className="text-muted-foreground">No currencies configured yet</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                Add your first currency
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeCurrencies.map((storeCurrency) => {
                    const currency = storeCurrency.currency
                    if (!currency) return null

                    return (
                      <TableRow key={storeCurrency.id}>
                        <TableCell className="font-medium">{currency.title}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-sm">
                            {currency.symbol}
                          </code>
                        </TableCell>
                        <TableCell>
                          {currency.network?.title || currency.networkId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{currency.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              currency.status === 'ACTIVE' ? 'success' : 'secondary'
                            }
                          >
                            {currency.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCurrency(currency.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Currency Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Currency</DialogTitle>
            <DialogDescription>
              Select a cryptocurrency to accept as payment at this store
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={selectedCurrencyId}
                onValueChange={setSelectedCurrencyId}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      All available currencies have been added
                    </div>
                  ) : (
                    availableToAdd.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currency.title}</span>
                          <span className="text-muted-foreground">({currency.symbol})</span>
                          <Badge variant="outline" className="ml-auto">
                            {currency.network?.title}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setSelectedCurrencyId('')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCurrency}
              disabled={!selectedCurrencyId || isSubmitting}
            >
              Add Currency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
