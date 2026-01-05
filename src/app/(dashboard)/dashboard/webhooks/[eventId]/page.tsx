'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WebhookEventDetail } from '@/components/webhooks/webhook-event-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebhookViewModel } from '@/viewmodels/webhook.viewmodel'
import { useToast } from '@/hooks/use-toast'

export default function WebhookEventDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.eventId as string
  const storeId = searchParams.get('store') || ''
  const { selectedEvent, isLoading, getWebhookEvent, retryWebhookEvent } =
    useWebhookViewModel()
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (storeId && eventId) {
      getWebhookEvent(storeId, eventId)
    }
  }, [storeId, eventId, getWebhookEvent])

  const handleRetry = async () => {
    if (!selectedEvent) return

    setIsRetrying(true)
    const success = await retryWebhookEvent(storeId, selectedEvent.id)
    setIsRetrying(false)

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

  const handleBack = () => {
    router.push(`/dashboard/webhooks?store=${storeId}`)
  }

  if (isLoading || !selectedEvent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const canRetry = selectedEvent.status === 'FAILED' || selectedEvent.status === 'PENDING'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Webhook Event Details</h1>
            <p className="text-sm text-muted-foreground">
              Event ID: <code className="text-xs">{eventId}</code>
            </p>
          </div>
        </div>
        {canRetry && (
          <Button onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry Webhook
          </Button>
        )}
      </div>

      <WebhookEventDetail event={selectedEvent} />
    </div>
  )
}
