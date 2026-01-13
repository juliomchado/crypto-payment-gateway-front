'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WebhookEventTable } from '@/components/webhooks/webhook-event-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWebhookViewModel } from '@/viewmodels/webhook.viewmodel'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useActiveStore } from '@/contexts/active-store.context'
import { useToast } from '@/hooks/use-toast'
import type { WebhookEvent, WebhookDeliveryStatus } from '@/models/types'

export default function WebhooksPage() {
  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get('store')
  const { activeStoreId, isAllStores } = useActiveStore()
  const { toast } = useToast()
  const { webhookEvents, isLoading, fetchWebhookEvents, retryWebhookEvent } =
    useWebhookViewModel()
  const { stores, fetchStores } = useStoreViewModel()
  const [statusFilter, setStatusFilter] = useState<WebhookDeliveryStatus | 'ALL'>('ALL')

  // Use store from URL param, or header selector, or first available store
  const effectiveStoreId = storeIdParam || (!isAllStores ? activeStoreId : stores[0]?.id)

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    if (effectiveStoreId) {
      const query = statusFilter !== 'ALL' ? { status: statusFilter } : undefined
      fetchWebhookEvents(effectiveStoreId, query)
    }
  }, [effectiveStoreId, statusFilter, fetchWebhookEvents])

  const handleRetry = async (event: WebhookEvent) => {
    if (!effectiveStoreId) return

    const success = await retryWebhookEvent(effectiveStoreId, event.id)
    if (success) {
      toast({
        title: 'Webhook retried',
        description: 'The webhook event has been queued for retry.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Retry failed',
        description: 'Failed to retry the webhook event.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhook Events</h1>
        <p className="text-muted-foreground">
          View and manage webhook event delivery status for your stores.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isAllStores && (
          <p className="text-sm text-muted-foreground">
            Select a specific store in the header to view webhook events.
          </p>
        )}

        <div className="w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WebhookDeliveryStatus | 'ALL')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {effectiveStoreId ? (
        <WebhookEventTable
          webhookEvents={webhookEvents}
          storeId={effectiveStoreId}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">Please select a store to view webhook events</p>
        </div>
      )}
    </div>
  )
}
