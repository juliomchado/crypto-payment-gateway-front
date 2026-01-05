'use client'

import { useEffect } from 'react'
import { DollarSign, FileText, TrendingUp, Store } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentInvoices } from '@/components/dashboard/recent-invoices'
import { useDashboardViewModel } from '@/viewmodels/dashboard.viewmodel'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import { useActiveStore } from '@/contexts/active-store.context'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthViewModel()
  const { activeStoreId, isAllStores } = useActiveStore()
  const { stats, revenueData, recentInvoices, isLoading, fetchDashboardData } =
    useDashboardViewModel()

  useEffect(() => {
    // Pass store ID only if a specific store is selected (not "All Stores")
    const storeIdFilter = !isAllStores && activeStoreId ? activeStoreId : undefined
    fetchDashboardData(storeIdFilter)
  }, [fetchDashboardData, activeStoreId, isAllStores])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'User'}</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : '$0'}
          change={stats ? `+${stats.revenueChange}% from last month` : undefined}
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Invoices"
          value={stats?.totalInvoices.toString() || '0'}
          change={stats ? `+${stats.invoicesToday} today` : undefined}
          changeType="positive"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Success Rate"
          value={stats ? `${stats.successRate}%` : '0%'}
          change="Payment success rate"
          changeType="neutral"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Active Stores"
          value={stats?.activeStores.toString() || '0'}
          change="Currently active"
          changeType="neutral"
          icon={<Store className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <RecentInvoices invoices={recentInvoices} isLoading={isLoading} />
      </div>
    </div>
  )
}
