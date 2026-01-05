import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_INVOICES } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { WebhookEvent, WebhookEventStatus, ApiResponse } from '@/models/types'

export interface ListWebhookEventsQuery {
  skip?: number
  take?: number
  status?: WebhookEventStatus
}

class WebhookService {
  private mockWebhookEvents: WebhookEvent[] = []

  constructor() {
    // Initialize with some mock webhook events
    if (CONFIG.USE_MOCK) {
      const invoice = MOCK_INVOICES[0]
      this.mockWebhookEvents = [
        {
          id: generateId(),
          storeId: invoice.storeId,
          invoiceId: invoice.id,
          event: 'payment.created',
          url: 'https://example.com/webhooks/payment',
          payload: { invoiceId: invoice.id, status: 'PENDING' },
          response: {
            status: 200,
            body: '{"success": true}',
          },
          attempts: 1,
          maxAttempts: 3,
          status: 'DELIVERED',
          deliveredAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: generateId(),
          storeId: invoice.storeId,
          invoiceId: invoice.id,
          event: 'payment.confirmed',
          url: 'https://example.com/webhooks/payment',
          payload: { invoiceId: invoice.id, status: 'CONFIRMED' },
          attempts: 2,
          maxAttempts: 3,
          status: 'FAILED',
          errorMessage: 'Connection timeout',
          failedAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: generateId(),
          storeId: invoice.storeId,
          invoiceId: invoice.id,
          event: 'payment.detecting',
          url: 'https://example.com/webhooks/payment',
          payload: { invoiceId: invoice.id, status: 'DETECTING' },
          attempts: 0,
          maxAttempts: 3,
          status: 'PENDING',
          nextRetryAt: new Date(Date.now() + 600000).toISOString(),
          createdAt: new Date(Date.now() - 300000).toISOString(),
          updatedAt: new Date(Date.now() - 300000).toISOString(),
        },
      ]
    }
  }

  async listWebhookEvents(
    storeId: string,
    query?: ListWebhookEventsQuery
  ): Promise<WebhookEvent[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      let events = this.mockWebhookEvents.filter((event) => event.storeId === storeId)

      if (query?.status) {
        events = events.filter((event) => event.status === query.status)
      }

      const skip = query?.skip || 0
      const take = query?.take || 20
      return events.slice(skip, skip + take)
    }

    const params = new URLSearchParams()
    if (query?.skip !== undefined) params.set('skip', query.skip.toString())
    if (query?.take !== undefined) params.set('take', query.take.toString())
    if (query?.status) params.set('status', query.status)

    const response = await api.get<ApiResponse<WebhookEvent[]>>(
      `/stores/${storeId}/webhooks?${params.toString()}`
    )
    return response.data
  }

  async getWebhookEvent(storeId: string, eventId: string): Promise<WebhookEvent> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const event = this.mockWebhookEvents.find(
        (e) => e.id === eventId && e.storeId === storeId
      )
      if (!event) {
        throw { message: 'Webhook event not found', statusCode: 404 }
      }
      return event
    }

    const response = await api.get<ApiResponse<WebhookEvent>>(
      `/stores/${storeId}/webhooks/${eventId}`
    )
    return response.data
  }

  async retryWebhookEvent(storeId: string, eventId: string): Promise<WebhookEvent> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay(1000)
      const index = this.mockWebhookEvents.findIndex(
        (e) => e.id === eventId && e.storeId === storeId
      )
      if (index === -1) {
        throw { message: 'Webhook event not found', statusCode: 404 }
      }

      const event = this.mockWebhookEvents[index]
      if (event.status === 'DELIVERED') {
        throw { message: 'Cannot retry a delivered webhook', statusCode: 400 }
      }

      // Simulate retry
      const success = Math.random() > 0.5
      this.mockWebhookEvents[index] = {
        ...event,
        attempts: event.attempts + 1,
        status: success ? 'DELIVERED' : event.attempts + 1 >= event.maxAttempts ? 'FAILED' : 'PENDING',
        response: success
          ? {
              status: 200,
              body: '{"success": true}',
            }
          : event.response,
        deliveredAt: success ? new Date().toISOString() : event.deliveredAt,
        failedAt: !success && event.attempts + 1 >= event.maxAttempts ? new Date().toISOString() : event.failedAt,
        errorMessage: !success ? 'Connection timeout' : undefined,
        nextRetryAt: !success && event.attempts + 1 < event.maxAttempts
          ? new Date(Date.now() + 600000).toISOString()
          : undefined,
        updatedAt: new Date().toISOString(),
      }
      return this.mockWebhookEvents[index]
    }

    const response = await api.post<ApiResponse<WebhookEvent>>(
      `/stores/${storeId}/webhooks/${eventId}/retry`
    )
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const webhookService = new WebhookService()
