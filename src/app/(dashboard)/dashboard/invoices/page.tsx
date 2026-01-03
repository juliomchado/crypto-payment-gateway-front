'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceTable } from '@/components/invoices/invoice-table'
import { InvoiceFilters } from '@/components/invoices/invoice-filters'
import { CreateInvoiceDialog } from '@/components/invoices/create-invoice-dialog'
import { useInvoiceViewModel } from '@/viewmodels/invoice.viewmodel'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import type { InvoiceStatus } from '@/models/types'

export default function InvoicesPage() {
  const { invoices, isLoading, fetchInvoices, setFilters } = useInvoiceViewModel()
  const { stores, fetchStores } = useStoreViewModel()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchInvoices()
    fetchStores()
  }, [fetchInvoices, fetchStores])

  const handleStatusChange = (status: InvoiceStatus | 'all') => {
    setFilters({ status: status === 'all' ? undefined : status, page: 1 })
    fetchInvoices()
  }

  const handleStoreChange = (storeId: string) => {
    setFilters({ storeId: storeId === 'all' ? undefined : storeId, page: 1 })
    fetchInvoices()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredInvoices = searchQuery
    ? invoices.filter((inv) =>
        inv.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">View and manage payment invoices.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <InvoiceFilters
        onStatusChange={handleStatusChange}
        onStoreChange={handleStoreChange}
        onSearch={handleSearch}
        stores={stores}
      />

      <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />

      <CreateInvoiceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
