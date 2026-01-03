'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Invoice, InvoiceStatus } from '@/models/types'

interface InvoiceTableProps {
  invoices: Invoice[]
  isLoading?: boolean
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  AWAITING_PAYMENT: { label: 'Awaiting', variant: 'warning' },
  CONFIRMING: { label: 'Confirming', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const status = statusConfig[invoice.status]
            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.orderId}</TableCell>
                <TableCell>
                  {formatCurrency(invoice.amount, invoice.currency)}
                  {invoice.cryptoCurrency && (
                    <div className="text-xs text-muted-foreground">
                      {invoice.cryptoAmount} {invoice.cryptoCurrency}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{invoice.store?.name || 'N/A'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(invoice.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/invoices/${invoice.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
