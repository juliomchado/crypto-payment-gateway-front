'use client'

import Link from 'next/link'
import { Eye, RefreshCw } from 'lucide-react'
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
import { formatDateTime } from '@/lib/utils'
import type { WebhookEvent } from '@/models/types'

interface WebhookEventTableProps {
  webhookEvents: WebhookEvent[]
  storeId: string
  isLoading?: boolean
  onRetry?: (event: WebhookEvent) => void
}

const eventLabels: Record<string, string> = {
  'payment.created': 'Payment Created',
  'payment.detecting': 'Payment Detecting',
  'payment.confirming': 'Payment Confirming',
  'payment.confirmed': 'Payment Confirmed',
  'payment.overpaid': 'Payment Overpaid',
  'payment.underpaid': 'Payment Underpaid',
  'payment.expired': 'Payment Expired',
  'payment.failed': 'Payment Failed',
  'payment.refunding': 'Payment Refunding',
  'payment.refunded': 'Payment Refunded',
  'payment.cancelled': 'Payment Cancelled',
}

export function WebhookEventTable({
  webhookEvents,
  storeId,
  isLoading,
  onRetry,
}: WebhookEventTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (webhookEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">No webhook events found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhookEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                {eventLabels[event.eventType] || event.eventType}
              </TableCell>
              <TableCell>
                <code className="text-xs">{event.invoiceId.slice(0, 8)}...</code>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    event.status === 'DELIVERED'
                      ? 'success'
                      : event.status === 'FAILED'
                      ? 'destructive'
                      : 'warning'
                  }
                >
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {event.attemptCount} / {event.maxRetries}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(event.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/webhooks/${event.id}?store=${storeId}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {(event.status === 'FAILED' || event.status === 'PENDING') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRetry?.(event)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
