'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode.react'
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
  onBack: () => void
}

export function PaymentDetails({
  amount,
  currency,
  address,
  network,
  timeRemaining,
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

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Send exactly</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-lg font-bold">
                  {amount} {currency}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
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

          <div>
            <p className="text-sm font-medium text-muted-foreground">To this address</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/30 px-4 py-3">
                <p className="break-all text-sm font-mono">{address}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
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

        <div className="flex justify-center">
          <div className="rounded-xl border bg-white p-4">
            <QRCode value={address} size={200} />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              {NETWORK_NAMES[network] || network}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Expires in:{' '}
            <span className="font-mono font-semibold text-foreground">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
          <p className="text-sm text-muted-foreground">Waiting for payment...</p>
        </div>

        <Button variant="ghost" onClick={onBack} className="w-full">
          ← Back to currency selection
        </Button>
      </CardContent>
    </Card>
  )
}
