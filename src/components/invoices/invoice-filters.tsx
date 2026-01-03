'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { InvoiceStatus } from '@/models/types'

interface InvoiceFiltersProps {
  onStatusChange: (status: InvoiceStatus | 'all') => void
  onStoreChange: (storeId: string) => void
  onSearch: (query: string) => void
  stores?: Array<{ id: string; name: string }>
}

export function InvoiceFilters({
  onStatusChange,
  onStoreChange,
  onSearch,
  stores = [],
}: InvoiceFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Order ID..."
                className="pl-9"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(value) => onStatusChange(value as InvoiceStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="AWAITING_PAYMENT">Awaiting Payment</SelectItem>
                <SelectItem value="CONFIRMING">Confirming</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Store</Label>
            <Select onValueChange={onStoreChange}>
              <SelectTrigger>
                <SelectValue placeholder="All stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
