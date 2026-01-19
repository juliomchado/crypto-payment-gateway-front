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
  ): Promise<PaginatedResponse<WebhookEvent>> {
    const params = new URLSearchParams()
    const page = query?.page || 1
    const limit = query?.limit || 10
    params.set('skip', ((page - 1) * limit).toString())
    params.set('take', limit.toString())
    if (query?.status) params.set('status', query.status)
    const searchParams = params.toString()
    const endpoint = `/stores/${storeId}/webhooks?${searchParams}`

    // Backend always returns { data, pagination } structure
    interface WebhookListResponse {
      data: WebhookEvent[]
      pagination: {
        skip: number
        take: number
        total: number
      }
    }
    const response = await api.get<WebhookListResponse>(endpoint)

    // Return full paginated response
    return {
      data: response.data,
      total: response.pagination.total,
      page: Math.floor(response.pagination.skip / response.pagination.take) + 1,
      limit: response.pagination.take,
      totalPages: Math.ceil(response.pagination.total / response.pagination.take)
    }
  }

  async getWebhookEvent(storeId: string, eventId: string): Promise<WebhookEvent> {
    // Backend returns WebhookEvent directly (not wrapped in ApiResponse)
    const response = await api.get<WebhookEvent>(
      `/stores/${storeId}/webhooks/${eventId}`
    )
    return response
  }

  async retryWebhookEvent(storeId: string, eventId: string): Promise<{ message: string; eventId: string }> {
    // Backend returns { message, eventId } structure
    const response = await api.post<{ message: string; eventId: string }>(
      `/stores/${storeId}/webhooks/${eventId}/retry`
    )
    return response
  }
}

export const webhookService = new WebhookService()
