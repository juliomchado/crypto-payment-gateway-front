import { api } from './api'
import type { DashboardStats, RevenueDataPoint, Invoice, PaginatedResponse, ApiResponse, Store } from '@/models/types'

class DashboardService {
  // Calculate dashboard stats from invoices using backend /v1/invoice endpoint
  async getStats(storeId?: string, merchantId?: string): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams({ page: '1', limit: '1000' }) // Fetch all invoices
      if (storeId) params.append('storeId', storeId)
      if (merchantId) params.append('merchantId', merchantId)

      const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(`/v1/invoice?${params.toString()}`)
      const invoices = response.data?.data || []

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000))

      const completedInvoices = invoices.filter(inv => inv.status === 'CONFIRMED')

      // Calculate revenue for current and previous periods
      const currentPeriodRevenue = completedInvoices
        .filter(inv => new Date(inv.createdAt) >= thirtyDaysAgo)
        .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0)

      const previousPeriodRevenue = completedInvoices
        .filter(inv => {
          const createdAt = new Date(inv.createdAt)
          return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo
        })
        .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0)

      const revenueChange = previousPeriodRevenue > 0
        ? Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
        : 0

      // Fetch active stores count if not filtered by storeId
      let activeStores = storeId ? 1 : 0
      if (!storeId) {
        try {
          const storeParams = new URLSearchParams({ isActive: 'true' })
          if (merchantId) storeParams.append('merchantId', merchantId)
          const storesResponse = await api.get<ApiResponse<PaginatedResponse<Store>>>(`/stores?${storeParams.toString()}`)
          activeStores = storesResponse.data?.total || 0
        } catch (e) {
          console.error('Failed to fetch stores count:', e)
        }
      }

      const totalRevenue = completedInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0)

      const today = new Date().toDateString()
      const invoicesToday = invoices.filter(inv =>
        new Date(inv.createdAt).toDateString() === today
      ).length

      return {
        totalRevenue,
        totalInvoices: invoices.length,
        invoicesToday,
        successRate: invoices.length > 0
          ? Math.round((completedInvoices.length / invoices.length) * 100)
          : 0,
        revenueChange,
        activeStores,
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Fallback to empty stats
      return {
        totalRevenue: 0,
        totalInvoices: 0,
        invoicesToday: 0,
        successRate: 0,
        revenueChange: 0,
        activeStores: 0,
      }
    }
  }

  // Calculate revenue data from invoices using backend /v1/invoice endpoint
  async getRevenueData(days: number = 7, storeId?: string, merchantId?: string): Promise<RevenueDataPoint[]> {
    try {
      const params = new URLSearchParams({ page: '1', limit: '1000' })
      if (storeId) params.append('storeId', storeId)
      if (merchantId) params.append('merchantId', merchantId)

      const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(`/v1/invoice?${params.toString()}`)
      const invoices = response.data?.data || []

      // Group invoices by date for the last N days
      const revenueByDate = new Map<string, number>()
      const now = new Date()

      for (let i = 0; i < days; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
        revenueByDate.set(dateStr, 0)
      }

      // Calculate revenue for each day
      invoices
        .filter(inv => inv.status === 'CONFIRMED' && inv.confirmedAt)
        .forEach(inv => {
          const dateStr = new Date(inv.confirmedAt!).toISOString().split('T')[0]
          if (revenueByDate.has(dateStr)) {
            const current = revenueByDate.get(dateStr) || 0
            revenueByDate.set(dateStr, current + parseFloat(inv.amount || '0'))
          }
        })

      // Convert to array and sort by date
      const result: RevenueDataPoint[] = Array.from(revenueByDate.entries())
        .map(([date, revenue]) => ({
          date,
          revenue,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return result
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
      // Fallback to empty array
      return Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split('T')[0],
          revenue: 0,
        }
      }).reverse()
    }
  }

  // Fetch recent invoices using backend /v1/invoice endpoint
  async getRecentInvoices(limit: number = 5, storeId?: string, merchantId?: string): Promise<Invoice[]> {
    try {
      const params = new URLSearchParams({ page: '1', limit: limit.toString() })
      if (storeId) params.append('storeId', storeId)
      if (merchantId) params.append('merchantId', merchantId)

      const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(`/v1/invoice?${params.toString()}`)
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch recent invoices:', error)
      // Fallback to empty array
      return []
    }
  }
}

export const dashboardService = new DashboardService()
