import { api } from './api'
import type { WebhookEvent, WebhookDeliveryStatus, ApiResponse, PaginatedResponse } from '@/models/types'

export interface ListWebhookEventsQuery {
  page?: number
  limit?: number
  status?: WebhookDeliveryStatus
}

class WebhookService {
  async listWebhookEvents(
    storeId: string,
    query?: ListWebhookEventsQuery
  ): Promise<WebhookEvent[]> {
    const params = new URLSearchParams()
    const page = query?.page || 1
    const limit = query?.limit || 10
    params.set('skip', ((page - 1) * limit).toString())
    params.set('take', limit.toString())
    if (query?.status) params.set('status', query.status)
    const searchParams = params.toString()
    const endpoint = `/stores/${storeId}/webhooks?${searchParams}`
    const response = await api.get<ApiResponse<WebhookEvent[] | PaginatedResponse<WebhookEvent>>>(endpoint)

    // Handle both flat array and paginated object
    if (Array.isArray(response.data)) {
      return response.data
    } else if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  }

  async getWebhookEvent(storeId: string, eventId: string): Promise<WebhookEvent> {
    const response = await api.get<ApiResponse<WebhookEvent>>(
      `/stores/${storeId}/webhooks/${eventId}`
    )
    return response.data
  }

  async retryWebhookEvent(storeId: string, eventId: string): Promise<WebhookEvent> {
    const response = await api.post<ApiResponse<WebhookEvent>>(
      `/stores/${storeId}/webhooks/${eventId}/retry`
    )
    return response.data
  }
}

export const webhookService = new WebhookService()
