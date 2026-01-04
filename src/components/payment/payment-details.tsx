'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { copyToClipboard } from '@/lib/utils'
import { NETWORK_NAMES } from '@/models/mock-data'

interface PaymentDetailsProps {
  amount: string
  currency: string
  address: string
  network: string
  timeRemaining: number
  exchangeRate?: string  // Exchange rate locked at invoice creation
  onBack: () => void
}

export function PaymentDetails({
  amount,
  currency,
  address,
  network,
  timeRemaining,
  exchangeRate,
  onBack,
}: PaymentDetailsProps) {
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const handleCopy = async (text: string, type: 'amount' | 'address') => {
    try {
      await copyToClipboard(text)
      if (type === 'amount') {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      } else {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      }
    } catch {
      // Handle error silently
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isExpiringSoon = timeRemaining <= 300 // 5 minutes
  const isExpired = timeRemaining <= 0

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="rounded-xl border-2 bg-white p-3 shadow-md dark:border-border dark:bg-card sm:p-4">
          <QRCodeSVG value={address} size={200} level="H" className="h-auto w-full max-w-[200px]" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Amount</p>
            {exchangeRate && (
              <Badge variant="outline" className="text-xs">
                Rate: {exchangeRate}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border bg-muted/30 px-3 py-2 sm:py-2.5">
              <p className="text-base font-bold tabular-nums sm:text-lg">
                {amount} {currency.toUpperCase()}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              onClick={() => handleCopy(amount, 'amount')}
            >
              {copiedAmount ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Deposit Address</p>
            <Badge variant="secondary" className="text-xs">
              {NETWORK_NAMES[network] || network}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-lg border bg-muted/30 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <p className="break-all font-mono text-[10px] leading-relaxed sm:text-xs">{address}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              onClick={() => handleCopy(address, 'address')}
            >
              {copiedAddress ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-2.5 text-center sm:p-3 ${
        isExpired
          ? 'border-destructive/50 bg-destructive/10'
          : isExpiringSoon
            ? 'border-warning/50 bg-warning/10'
            : 'border-primary/50 bg-primary/10'
      }`}>
        <p className="text-xs font-medium text-muted-foreground">
          {isExpired ? 'Payment Expired' : 'Time Remaining'}
        </p>
        <p className={`mt-0.5 font-mono text-xl font-bold tabular-nums sm:text-2xl ${
          isExpired
            ? 'text-destructive'
            : isExpiringSoon
              ? 'text-warning'
              : 'text-primary'
        }`}>
          {formatTime(timeRemaining)}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Waiting for blockchain confirmation...
        </p>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        Change Payment Method
      </Button>
    </div>
  )
}
