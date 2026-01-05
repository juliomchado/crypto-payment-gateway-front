import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_DASHBOARD_STATS, MOCK_REVENUE_DATA, MOCK_INVOICES } from '@/models/mock-data'
import type { DashboardStats, RevenueDataPoint, Invoice, ApiResponse } from '@/models/types'

class DashboardService {
  async getStats(storeId?: string): Promise<DashboardStats> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      // If filtering by store, calculate stats for that store only
      if (storeId) {
        const storeInvoices = MOCK_INVOICES.filter(inv => inv.storeId === storeId)
        const completedInvoices = storeInvoices.filter(inv => inv.paymentStatus === 'COMPLETED')
        const totalRevenue = completedInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

        return {
          totalRevenue,
          totalInvoices: storeInvoices.length,
          invoicesToday: storeInvoices.filter(inv =>
            new Date(inv.createdAt).toDateString() === new Date().toDateString()
          ).length,
          successRate: storeInvoices.length > 0
            ? Math.round((completedInvoices.length / storeInvoices.length) * 100)
            : 0,
          revenueChange: 12.5, // Mock change percentage
          activeStores: 1, // Single store
        }
      }

      // Return aggregated stats for all stores
      return MOCK_DASHBOARD_STATS
    }

    const params = storeId ? `?storeId=${storeId}` : ''
    const response = await api.get<ApiResponse<DashboardStats>>(`/dashboard/stats${params}`)
    return response.data
  }

  async getRevenueData(days: number = 7, storeId?: string): Promise<RevenueDataPoint[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      // If filtering by store, adjust revenue data (mock implementation)
      const revenueData = MOCK_REVENUE_DATA.slice(-days)
      if (storeId) {
        // Reduce revenue by a factor to simulate single store
        return revenueData.map(point => ({
          ...point,
          revenue: point.revenue * 0.4, // 40% of total (simulating one of multiple stores)
        }))
      }

      return revenueData
    }

    const params = new URLSearchParams({ days: days.toString() })
    if (storeId) params.append('storeId', storeId)

    const response = await api.get<ApiResponse<RevenueDataPoint[]>>(
      `/dashboard/revenue?${params.toString()}`
    )
    return response.data
  }

  async getRecentInvoices(limit: number = 5, storeId?: string): Promise<Invoice[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      let invoices = MOCK_INVOICES
      if (storeId) {
        invoices = invoices.filter(inv => inv.storeId === storeId)
      }

      return invoices.slice(0, limit)
    }

    const params = new URLSearchParams({ limit: limit.toString() })
    if (storeId) params.append('storeId', storeId)

    const response = await api.get<ApiResponse<Invoice[]>>(
      `/dashboard/invoices/recent?${params.toString()}`
    )
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const dashboardService = new DashboardService()
