import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '@/models/types'

interface StatusBadgeProps {
  status: InvoiceStatus
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', variant: 'warning' },
  CONFIRMING: { label: 'Confirming', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
