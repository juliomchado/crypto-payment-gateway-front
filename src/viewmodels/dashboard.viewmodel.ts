import { create } from 'zustand'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardStats, RevenueDataPoint, Invoice } from '@/models/types'

interface DashboardState {
  stats: DashboardStats | null
  revenueData: RevenueDataPoint[]
  recentInvoices: Invoice[]
  isLoading: boolean
  error: string | null
}

interface DashboardActions {
  fetchDashboardData: (storeId?: string, merchantId?: string) => Promise<void>
  fetchStats: (storeId?: string, merchantId?: string) => Promise<void>
  fetchRevenueData: (days?: number, storeId?: string, merchantId?: string) => Promise<void>
  fetchRecentInvoices: (limit?: number, storeId?: string, merchantId?: string) => Promise<void>
  clearError: () => void
}

type DashboardViewModel = DashboardState & DashboardActions

export const useDashboardViewModel = create<DashboardViewModel>((set) => ({
  stats: null,
  revenueData: [],
  recentInvoices: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async (storeId?: string, merchantId?: string): Promise<void> => {
    // If we have neither storeId nor merchantId, we can't fetch dashboard data
    if (!storeId && !merchantId) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const [stats, revenueData, recentInvoices] = await Promise.all([
        dashboardService.getStats(storeId, merchantId),
        dashboardService.getRevenueData(7, storeId, merchantId),
        dashboardService.getRecentInvoices(5, storeId, merchantId),
      ])
      set({
        stats,
        revenueData,
        recentInvoices,
        isLoading: false,
      })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch dashboard data', isLoading: false })
    }
  },

  fetchStats: async (storeId?: string, merchantId?: string): Promise<void> => {
    try {
      const stats = await dashboardService.getStats(storeId, merchantId)
      set({ stats })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch stats' })
    }
  },

  fetchRevenueData: async (days: number = 7, storeId?: string, merchantId?: string): Promise<void> => {
    try {
      const revenueData = await dashboardService.getRevenueData(days, storeId, merchantId)
      set({ revenueData })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch revenue data' })
    }
  },

  fetchRecentInvoices: async (limit: number = 5, storeId?: string, merchantId?: string): Promise<void> => {
    try {
      const recentInvoices = await dashboardService.getRecentInvoices(limit, storeId, merchantId)
      set({ recentInvoices })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch recent invoices' })
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
