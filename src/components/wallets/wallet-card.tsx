import { Wallet, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, shortenAddress } from '@/lib/utils'
import { NETWORK_NAMES } from '@/models/mock-data'
import type { Wallet as WalletType } from '@/models/types'

interface WalletCardProps {
  wallet: WalletType
  onCopy?: (address: string) => void
}

export function WalletCard({ wallet, onCopy }: WalletCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {NETWORK_NAMES[wallet.network] || wallet.network}
            </div>
          </CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Address</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 text-xs">{shortenAddress(wallet.address, 8)}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onCopy?.(wallet.address)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold">{formatCurrency(wallet.balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Addresses</p>
            <p className="text-lg font-bold">{wallet.derivedAddressCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
