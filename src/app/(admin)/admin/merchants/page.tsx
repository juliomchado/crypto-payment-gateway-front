'use client'

import { useEffect, useState } from 'react'
import { useMerchantViewModel } from '@/viewmodels/merchant.viewmodel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { MoreHorizontal, CheckCircle, XCircle, Pause, Archive } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { MerchantStatus, Merchant } from '@/models/types'

const STATUS_CONFIG = {
  PENDING_APPROVAL: { label: 'Pending', variant: 'warning' as const, icon: Pause },
  APPROVED: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' as const, icon: Pause },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  ARCHIVED: { label: 'Archived', variant: 'secondary' as const, icon: Archive },
}

export default function AdminMerchantsPage() {
  const { merchants, isLoading, fetchMerchants, updateMerchantStatus } = useMerchantViewModel()
  const { toast } = useToast()
  const [filter, setFilter] = useState<'all' | 'pending'>('all')

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const handleStatusChange = async (merchantId: string, newStatus: MerchantStatus) => {
    const merchant = merchants.find(m => m.id === merchantId)
    if (!merchant) return

    const result = await updateMerchantStatus(merchantId, newStatus)
    if (result) {
      toast({
        title: 'Status updated',
        description: `${merchant.merchantName} is now ${STATUS_CONFIG[newStatus].label}`,
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update merchant status',
        variant: 'destructive',
      })
    }
  }

  const filteredMerchants = filter === 'pending'
    ? merchants.filter(m => m.status === 'PENDING_APPROVAL')
    : merchants

  const pendingCount = merchants.filter(m => m.status === 'PENDING_APPROVAL').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Merchant Management</h1>
        <p className="text-muted-foreground">
          Approve, reject, or suspend merchant accounts
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Merchants ({merchants.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending Approval ({pendingCount})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'pending' ? 'Pending Approval' : 'All Merchants'}
          </CardTitle>
          <CardDescription>
            {filter === 'pending'
              ? 'Review and approve new merchant applications'
              : 'Manage all merchant accounts in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'pending'
                ? 'No merchants pending approval'
                : 'No merchants found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant Name</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tax ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.map((merchant) => {
                  const statusInfo = STATUS_CONFIG[merchant.status]
                  const StatusIcon = statusInfo.icon

                  return (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        {merchant.merchantName}
                      </TableCell>
                      <TableCell>
                        {merchant.businessType || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {merchant.taxId || '-'}
                      </TableCell>
                      <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {merchant.status !== 'APPROVED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(merchant.id, 'APPROVED')}
                                className="text-green-600 cursor-pointer"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {merchant.status !== 'REJECTED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(merchant.id, 'REJECTED')}
                                className="text-red-600 cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            {merchant.status !== 'SUSPENDED' && merchant.status !== 'REJECTED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(merchant.id, 'SUSPENDED')}
                                className="text-orange-600 cursor-pointer"
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {merchant.status !== 'ARCHIVED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(merchant.id, 'ARCHIVED')}
                                className="text-gray-600 cursor-pointer"
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
