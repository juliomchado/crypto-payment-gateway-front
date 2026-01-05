import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface PaymentStatusProps {
  status: 'success' | 'expired' | 'error' | 'confirming'
  amount?: number | string
  currency?: string
  txHash?: string
  onRetry?: () => void
}

export function PaymentStatus({
  status,
  amount,
  currency,
  txHash,
  onRetry,
}: PaymentStatusProps) {
  const statusConfig = {
    success: {
      icon: <CheckCircle className="h-16 w-16 text-success" />,
      title: 'Payment Successful!',
      description: amount
        ? `${formatCurrency(amount, currency)} received`
        : 'Your payment has been confirmed',
      color: 'text-success',
    },
    confirming: {
      icon: <Loader2 className="h-16 w-16 animate-spin text-warning" />,
      title: 'Confirming Payment',
      description: 'Your payment is being confirmed on the blockchain...',
      color: 'text-warning',
    },
    expired: {
      icon: <AlertCircle className="h-16 w-16 text-warning" />,
      title: 'Payment Expired',
      description: 'This payment request has expired. Please contact the merchant to request a new payment link.',
      color: 'text-warning',
    },
    error: {
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      title: 'Payment Failed',
      description: 'Something went wrong. Please try again.',
      color: 'text-destructive',
    },
  }

  const config = statusConfig[status]

  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-6 p-12 text-center">
        {config.icon}
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${config.color}`}>{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        {txHash && (
          <div className="w-full space-y-1">
            <p className="text-sm text-muted-foreground">Transaction:</p>
            <code className="block rounded-lg bg-muted px-4 py-2 text-xs">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </code>
          </div>
        )}

        {status === 'success' && (
          <Button className="w-full">Return to Store</Button>
        )}

        {(status === 'expired' || status === 'error') && onRetry && (
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
