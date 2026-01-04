import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
    icon: 'Ξ',
  },
  {
    id: 'bsc',
    name: 'BSC',
    description: 'BEP-20',
    icon: 'B',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    description: 'MATIC',
    icon: 'P',
  },
  {
    id: 'solana',
    name: 'Solana',
    description: 'SPL',
    icon: 'S',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'BTC',
    icon: '₿',
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
          <SelectValue placeholder="Choose a network" />
        </SelectTrigger>
        <SelectContent>
          {filteredNetworks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {network.icon}
                </span>
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
