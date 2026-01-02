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
  fetchDashboardData: () => Promise<void>
  fetchStats: () => Promise<void>
  fetchRevenueData: (days?: number) => Promise<void>
  fetchRecentInvoices: (limit?: number) => Promise<void>
  clearError: () => void
}

type DashboardViewModel = DashboardState & DashboardActions

export const useDashboardViewModel = create<DashboardViewModel>((set) => ({
  stats: null,
  revenueData: [],
  recentInvoices: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const [stats, revenueData, recentInvoices] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRevenueData(),
        dashboardService.getRecentInvoices(),
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

  fetchStats: async (): Promise<void> => {
    try {
      const stats = await dashboardService.getStats()
      set({ stats })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch stats' })
    }
  },

  fetchRevenueData: async (days: number = 7): Promise<void> => {
    try {
      const revenueData = await dashboardService.getRevenueData(days)
      set({ revenueData })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch revenue data' })
    }
  },

  fetchRecentInvoices: async (limit: number = 5): Promise<void> => {
    try {
      const recentInvoices = await dashboardService.getRecentInvoices(limit)
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
