import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {filteredNetworks.map((network) => (
        <Card
          key={network.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50',
            selectedNetwork === network.id &&
              'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          )}
          onClick={() => onSelect(network.id)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {network.icon}
            </div>
            <div className="text-center">
              <div className="font-semibold">{network.name}</div>
              <div className="text-xs text-muted-foreground">
                {network.description}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
