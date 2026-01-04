import { cn } from '@/lib/utils'

interface CryptoIconProps {
  symbol: string
  size?: number
  className?: string
}

// Mapeamento de símbolos para URLs de ícones (usando CryptoLogos.cc para cores corretas)
const ICON_URLS: Record<string, string> = {
  // Cryptocurrencies - usando logos oficiais do CryptoLogos.cc
  'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
  'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
  'BUSD': 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
  'TRX': 'https://cryptologos.cc/logos/tron-trx-logo.svg',
  'LTC': 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.svg',
  'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg',

  // Networks (usando símbolos relacionados)
  'ERC_20': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'SPL': 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'TRC_20': 'https://cryptologos.cc/logos/tron-trx-logo.svg',
  'BITCOIN': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'LIGHTNING': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'LITECOIN': 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.svg',
  'DOGECOIN': 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg',
}

export function CryptoIcon({ symbol, size = 24, className }: CryptoIconProps) {
  const iconUrl = ICON_URLS[symbol.toUpperCase()]

  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={symbol}
          width={size}
          height={size}
          style={{ width: size, height: size }}
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
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}
