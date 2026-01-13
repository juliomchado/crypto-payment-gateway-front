'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice, PaymentStatus } from '@/models/types'

interface RecentInvoicesProps {
  invoices: Invoice[]
  isLoading?: boolean
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  DETECTED: { label: 'Detected', variant: 'warning' },
  CONFIRMING: { label: 'Confirming', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  OVERPAID: { label: 'Overpaid', variant: 'warning' },
  UNDERPAID: { label: 'Underpaid', variant: 'warning' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  REFUNDING: { label: 'Refunding', variant: 'warning' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export function RecentInvoices({ invoices, isLoading }: RecentInvoicesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Invoices</CardTitle>
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No invoices yet
          </p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status] || {
                label: invoice.status || 'Unknown',
                variant: 'secondary' as const,
              }
              return (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.orderId} • {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
