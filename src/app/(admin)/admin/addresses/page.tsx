'use client'

import { useState } from 'react'
import { walletService } from '@/services/wallet.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Copy, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Address, ApiError } from '@/models/types'

export default function AddressLookupPage() {
  const [addressString, setAddressString] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [addressData, setAddressData] = useState<Address | null>(null)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addressString.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter a blockchain address',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const data = await walletService.lookupAddress(addressString.trim())
      setAddressData(data)
      toast({
        title: 'Address found',
        description: 'Address details loaded successfully',
      })
    } catch (err: unknown) {
      const error = err as ApiError
      toast({
        title: 'Address not found',
        description: error.message || 'This address is not in our system',
        variant: 'destructive',
      })
      setAddressData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Address Lookup</h1>
        <p className="text-muted-foreground">
          Search for blockchain addresses in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Address</CardTitle>
          <CardDescription>
            Enter a blockchain address to view its details and associated invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Blockchain Address</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="0x742d35Cc6cC6815AC3E2ead93F99F035e81f..."
                  value={addressString}
                  onChange={(e) => setAddressString(e.target.value)}
                  disabled={isLoading}
                  className="font-mono"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {addressData && (
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
            <CardDescription>
              Information about this blockchain address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm break-all">{addressData.address}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(addressData.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={['ASSIGNED', 'USED'].includes(addressData.status) ? 'default' : 'secondary'}>
                      {addressData.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Total Received</Label>
                  <p className="mt-1 font-medium">{addressData.totalReceived || '0'} crypto</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="mt-1">{formatDate(addressData.createdAt)}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Master Wallet ID</Label>
                  <p className="mt-1 font-mono text-sm">{addressData.masterWalletId}</p>
                </div>
              </div>

              {addressData.invoiceId && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Associated Invoice</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-sm">{addressData.invoiceId}</p>
                    <Link href={`/dashboard/invoices/${addressData.invoiceId}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
