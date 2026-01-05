import { create } from 'zustand'
import { webhookService, type ListWebhookEventsQuery } from '@/services/webhook.service'
import type { WebhookEvent } from '@/models/types'

interface WebhookState {
  webhookEvents: WebhookEvent[]
  selectedEvent: WebhookEvent | null
  isLoading: boolean
  error: string | null
}

interface WebhookActions {
  fetchWebhookEvents: (storeId: string, query?: ListWebhookEventsQuery) => Promise<void>
  getWebhookEvent: (storeId: string, eventId: string) => Promise<void>
  retryWebhookEvent: (storeId: string, eventId: string) => Promise<boolean>
  clearError: () => void
}

type WebhookViewModel = WebhookState & WebhookActions

export const useWebhookViewModel = create<WebhookViewModel>((set) => ({
  webhookEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchWebhookEvents: async (
    storeId: string,
    query?: ListWebhookEventsQuery
  ): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const webhookEvents = await webhookService.listWebhookEvents(storeId, query)
      set({ webhookEvents, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch webhook events', isLoading: false })
    }
  },

  getWebhookEvent: async (storeId: string, eventId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const selectedEvent = await webhookService.getWebhookEvent(storeId, eventId)
      set({ selectedEvent, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch webhook event', isLoading: false })
    }
  },

  retryWebhookEvent: async (storeId: string, eventId: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const updatedEvent = await webhookService.retryWebhookEvent(storeId, eventId)
      set((state) => ({
        webhookEvents: state.webhookEvents.map((event) =>
          event.id === eventId ? updatedEvent : event
        ),
        selectedEvent:
          state.selectedEvent?.id === eventId ? updatedEvent : state.selectedEvent,
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to retry webhook event', isLoading: false })
      return false
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
