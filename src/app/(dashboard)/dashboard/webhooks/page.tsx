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
import { useToast } from '@/hooks/use-toast'
import type { WebhookEvent, WebhookEventStatus } from '@/models/types'

export default function WebhooksPage() {
  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get('store')
  const { toast } = useToast()
  const { webhookEvents, isLoading, fetchWebhookEvents, retryWebhookEvent } =
    useWebhookViewModel()
  const { stores, fetchStores } = useStoreViewModel()
  const [selectedStoreId, setSelectedStoreId] = useState<string>(storeIdParam || '')
  const [statusFilter, setStatusFilter] = useState<WebhookEventStatus | 'ALL'>('ALL')

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    if (selectedStoreId) {
      const query = statusFilter !== 'ALL' ? { status: statusFilter } : undefined
      fetchWebhookEvents(selectedStoreId, query)
    }
  }, [selectedStoreId, statusFilter, fetchWebhookEvents])

  useEffect(() => {
    if (storeIdParam && storeIdParam !== selectedStoreId) {
      setSelectedStoreId(storeIdParam)
    }
  }, [storeIdParam, selectedStoreId])

  const handleRetry = async (event: WebhookEvent) => {
    const success = await retryWebhookEvent(selectedStoreId, event.id)
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

      <div className="flex gap-4">
        <div className="w-64">
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WebhookEventStatus | 'ALL')}>
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

      {selectedStoreId ? (
        <WebhookEventTable
          webhookEvents={webhookEvents}
          storeId={selectedStoreId}
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
