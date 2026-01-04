import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CryptoIcon } from '@/components/ui/crypto-icon'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface NetworkOption {
  id: string
  name: string
  description: string
  icon: string
}

const NETWORKS: NetworkOption[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    description: 'ERC-20',
    icon: 'ETH',
  },
  {
    id: 'bsc',
    name: 'BSC',
    description: 'BEP-20',
    icon: 'BNB',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    description: 'MATIC',
    icon: 'MATIC',
  },
  {
    id: 'solana',
    name: 'Solana',
    description: 'SPL',
    icon: 'SOL',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'BTC',
    icon: 'BTC',
  },
]

interface NetworkSelectorProps {
  selectedNetwork: string | null
  availableNetworks: string[]
  onSelect: (network: string) => void
}

export function NetworkSelector({
  selectedNetwork,
  availableNetworks,
  onSelect,
}: NetworkSelectorProps) {
  const filteredNetworks = NETWORKS.filter((n) =>
    availableNetworks.includes(n.id)
  )

  return (
    <div className="space-y-2">
      <Label htmlFor="network-select">Select Network</Label>
      <Select value={selectedNetwork || ''} onValueChange={onSelect}>
        <SelectTrigger id="network-select" className="w-full">
          <SelectValue placeholder="Choose a network">
            {selectedNetwork && filteredNetworks.find((n) => n.id === selectedNetwork) && (
              <div className="flex items-center gap-2">
                <CryptoIcon
                  symbol={filteredNetworks.find((n) => n.id === selectedNetwork)!.icon}
                  size={20}
                />
                <span className="font-medium">
                  {filteredNetworks.find((n) => n.id === selectedNetwork)!.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {filteredNetworks.find((n) => n.id === selectedNetwork)!.description}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredNetworks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={network.icon} size={20} />
                <div className="flex flex-col">
                  <span className="font-medium">{network.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {network.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedNetwork && !['ethereum', 'bsc', 'polygon'].includes(selectedNetwork) && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
            Atenção: Pagamentos em redes não-EVM estão temporariamente limitados devido a manutenção do backend.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
