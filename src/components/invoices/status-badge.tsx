import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/models/types'

interface StatusBadgeProps {
  status: PaymentStatus
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  DETECTING: { label: 'Detecting', variant: 'warning' },
  CONFIRMING: { label: 'Confirming', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  OVERPAID: { label: 'Overpaid', variant: 'warning' },
  UNDERPAID: { label: 'Underpaid', variant: 'warning' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  REFUNDING: { label: 'Refunding', variant: 'warning' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    variant: 'secondary' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
