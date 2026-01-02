import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_DASHBOARD_STATS, MOCK_REVENUE_DATA, MOCK_INVOICES } from '@/models/mock-data'
import type { DashboardStats, RevenueDataPoint, Invoice, ApiResponse } from '@/models/types'

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return MOCK_DASHBOARD_STATS
    }
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return response.data
  }

  async getRevenueData(days: number = 7): Promise<RevenueDataPoint[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return MOCK_REVENUE_DATA.slice(-days)
    }
    const response = await api.get<ApiResponse<RevenueDataPoint[]>>(
      `/dashboard/revenue?days=${days}`
    )
    return response.data
  }

  async getRecentInvoices(limit: number = 5): Promise<Invoice[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      return MOCK_INVOICES.slice(0, limit)
    }
    const response = await api.get<ApiResponse<Invoice[]>>(
      `/dashboard/invoices/recent?limit=${limit}`
    )
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const dashboardService = new DashboardService()
