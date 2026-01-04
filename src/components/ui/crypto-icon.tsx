import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CryptoIconProps {
  symbol: string
  size?: number
  className?: string
}

// Mapeamento de símbolos para nomes corretos do cryptocurrency-icons
const SYMBOL_MAP: Record<string, string> = {
  // Cryptocurrencies
  'BTC': 'btc',
  'ETH': 'eth',
  'USDT': 'usdt',
  'USDC': 'usdc',
  'BNB': 'bnb',
  'SOL': 'sol',
  'MATIC': 'matic',
  'DAI': 'dai',
  'BUSD': 'busd',
  'TRX': 'trx',
  'LTC': 'ltc',
  'XRP': 'xrp',
  'DOGE': 'doge',

  // Networks (usando símbolos relacionados)
  'ERC_20': 'eth',
  'SPL': 'sol',
  'TRC_20': 'trx',
  'BITCOIN': 'btc',
  'LIGHTNING': 'btc',
  'LITECOIN': 'ltc',
  'XRP': 'xrp',
  'DOGECOIN': 'doge',
}

export function CryptoIcon({ symbol, size = 24, className }: CryptoIconProps) {
  const iconName = SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase()

  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${iconName}.png`}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-full"
        onError={(e) => {
          // Fallback para ícone genérico se não encontrar
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">${symbol.slice(0, 2).toUpperCase()}</div>`
          }
        }}
      />
    </div>
  )
}
