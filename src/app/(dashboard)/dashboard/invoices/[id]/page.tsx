'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/invoices/status-badge'
import { useInvoiceViewModel } from '@/viewmodels/invoice.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDateTime, shortenAddress, copyToClipboard } from '@/lib/utils'
import { NETWORK_NAMES } from '@/models/types'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const { selectedInvoice, isLoading, fetchInvoice } = useInvoiceViewModel()
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoice(invoiceId)
  }, [invoiceId, fetchInvoice])

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text)
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard.`,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy to clipboard.',
      })
    }
  }

  if (isLoading && !selectedInvoice) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  if (!selectedInvoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/invoices')}>
          Back to Invoices
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Invoice {selectedInvoice.orderId}</h1>
          <p className="text-muted-foreground">
            Created {formatDateTime(selectedInvoice.createdAt)}
          </p>
        </div>
        <StatusBadge status={selectedInvoice.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invoice ID</span>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {selectedInvoice.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(selectedInvoice.id, 'Invoice ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="text-sm font-medium">{selectedInvoice.orderId}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-bold">
                {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
              </span>
            </div>

            {selectedInvoice.cryptoCurrency && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crypto Amount</span>
                <span className="text-sm font-medium">
                  {selectedInvoice.cryptoAmount} {selectedInvoice.cryptoCurrency}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Store</span>
              <span className="text-sm font-medium">{selectedInvoice.store?.name || 'N/A'}</span>
            </div>

            {selectedInvoice.customerEmail && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customer Email</span>
                <span className="text-sm font-medium">{selectedInvoice.customerEmail}</span>
              </div>
            )}

            {selectedInvoice.networkId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium">
                  {NETWORK_NAMES[selectedInvoice.networkId] || 'Unknown'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            {selectedInvoice.paymentAddress && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Payment Address</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 overflow-hidden text-ellipsis rounded bg-muted px-3 py-2 text-xs">
                      {selectedInvoice.paymentAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleCopy(
                          selectedInvoice.paymentAddress!,
                          'Payment address'
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {selectedInvoice.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires At</span>
                <span className="text-sm font-medium">
                  {formatDateTime(selectedInvoice.expiresAt)}
                </span>
              </div>
            )}

            {selectedInvoice.status === 'PENDING' && (
              <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                <p className="text-sm font-medium">Awaiting Payment</p>
                <p className="mt-1 text-xs">
                  Waiting for customer to send payment to the address above.
                </p>
              </div>
            )}

            {selectedInvoice.status === 'CONFIRMED' && (
              <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                <p className="text-sm font-medium">Payment Confirmed</p>
                <p className="mt-1 text-xs">
                  This invoice has been paid successfully.
                </p>
              </div>
            )}

            {selectedInvoice.paymentAddress && (
              <Link
                href={`/pay/${selectedInvoice.id}`}
                target="_blank"
                className="mt-2 block w-full"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Payment Page
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
