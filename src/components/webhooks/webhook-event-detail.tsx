'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/utils'
import type { WebhookEvent } from '@/models/types'

interface WebhookEventDetailProps {
  event: WebhookEvent
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

export function WebhookEventDetail({ event }: WebhookEventDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Information about this webhook event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Event Type</p>
              <p className="text-sm">{eventLabels[event.event] || event.event}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
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
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice ID</p>
              <code className="text-sm">{event.invoiceId}</code>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Webhook URL</p>
              <p className="text-sm truncate">{event.url}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attempts</p>
              <p className="text-sm">
                {event.attempts} / {event.maxAttempts}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{formatDateTime(event.createdAt)}</p>
            </div>
            {event.deliveredAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered At</p>
                <p className="text-sm">{formatDateTime(event.deliveredAt)}</p>
              </div>
            )}
            {event.failedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed At</p>
                <p className="text-sm">{formatDateTime(event.failedAt)}</p>
              </div>
            )}
            {event.nextRetryAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Retry At</p>
                <p className="text-sm">{formatDateTime(event.nextRetryAt)}</p>
              </div>
            )}
          </div>

          {event.errorMessage && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Error Message</p>
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {event.errorMessage}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Payload</CardTitle>
          <CardDescription>The data sent to the webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
            <code>{JSON.stringify(event.payload, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>

      {event.response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>The response received from the webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status Code</p>
              <Badge variant={event.response.status === 200 ? 'success' : 'destructive'}>
                {event.response.status}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Response Body</p>
              <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
                <code>{event.response.body}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
