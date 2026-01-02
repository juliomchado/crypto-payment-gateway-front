import type {
  User,
  Merchant,
  Store,
  StoreCurrency,
  Currency,
  Invoice,
  Wallet,
  ApiKey,
  DashboardStats,
  RevenueDataPoint,
} from './types'

// Mock User
export const MOCK_USER: User = {
  id: '019b57ef-0000-0000-0000-000000000001',
  email: 'demo@cryptogateway.com',
  name: 'Demo User',
  role: 'MERCHANT',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

// Mock Merchant
export const MOCK_MERCHANT: Merchant = {
  id: '019b57ef-0000-0000-0000-000000000002',
  name: 'Demo Merchant',
  userId: MOCK_USER.id,
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

// Mock Currencies
export const MOCK_CURRENCIES: Currency[] = [
  {
    id: 'currency-001',
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ethereum',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    iconUrl: '/icons/usdt.svg',
  },
  {
    id: 'currency-002',
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ethereum',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    iconUrl: '/icons/usdc.svg',
  },
  {
    id: 'currency-003',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ethereum',
    decimals: 18,
    iconUrl: '/icons/eth.svg',
  },
  {
    id: 'currency-004',
    symbol: 'USDT',
    name: 'Tether USD (BSC)',
    network: 'bsc',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    iconUrl: '/icons/usdt.svg',
  },
  {
    id: 'currency-005',
    symbol: 'BNB',
    name: 'Binance Coin',
    network: 'bsc',
    decimals: 18,
    iconUrl: '/icons/bnb.svg',
  },
  {
    id: 'currency-006',
    symbol: 'SOL',
    name: 'Solana',
    network: 'solana',
    decimals: 9,
    iconUrl: '/icons/sol.svg',
  },
  {
    id: 'currency-007',
    symbol: 'USDC',
    name: 'USD Coin (Solana)',
    network: 'solana',
    contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    iconUrl: '/icons/usdc.svg',
  },
]

// Mock Stores
export const MOCK_STORES: Store[] = [
  {
    id: 'store-001',
    name: 'My E-commerce',
    merchantId: MOCK_MERCHANT.id,
    isActive: true,
    invoiceCount: 156,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  },
  {
    id: 'store-002',
    name: 'Digital Products',
    merchantId: MOCK_MERCHANT.id,
    isActive: true,
    invoiceCount: 89,
    createdAt: '2024-02-20T08:30:00.000Z',
    updatedAt: '2024-05-15T14:00:00.000Z',
  },
  {
    id: 'store-003',
    name: 'NFT Marketplace',
    merchantId: MOCK_MERCHANT.id,
    isActive: false,
    invoiceCount: 23,
    createdAt: '2024-03-10T16:45:00.000Z',
    updatedAt: '2024-04-01T09:00:00.000Z',
  },
]

// Mock Store Currencies
export const MOCK_STORE_CURRENCIES: StoreCurrency[] = [
  {
    id: 'sc-001',
    storeId: 'store-001',
    currencyId: 'currency-001',
    currency: MOCK_CURRENCIES[0],
    minAmount: 10,
    maxAmount: 10000,
    isEnabled: true,
  },
  {
    id: 'sc-002',
    storeId: 'store-001',
    currencyId: 'currency-002',
    currency: MOCK_CURRENCIES[1],
    minAmount: 10,
    maxAmount: 10000,
    isEnabled: true,
  },
  {
    id: 'sc-003',
    storeId: 'store-001',
    currencyId: 'currency-003',
    currency: MOCK_CURRENCIES[2],
    minAmount: 0.01,
    maxAmount: 5,
    isEnabled: true,
  },
  {
    id: 'sc-004',
    storeId: 'store-002',
    currencyId: 'currency-001',
    currency: MOCK_CURRENCIES[0],
    minAmount: 5,
    maxAmount: 5000,
    isEnabled: true,
  },
  {
    id: 'sc-005',
    storeId: 'store-002',
    currencyId: 'currency-006',
    currency: MOCK_CURRENCIES[5],
    minAmount: 0.1,
    maxAmount: 100,
    isEnabled: true,
  },
]

// Mock Invoices
export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    storeId: 'store-001',
    store: MOCK_STORES[0],
    orderId: 'ORD-12345',
    amount: 50.0,
    currency: 'USD',
    cryptoAmount: 50.0,
    cryptoCurrency: 'USDT',
    status: 'PAID',
    paymentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1a812',
    network: 'ethereum',
    paidAt: '2024-06-01T10:30:00.000Z',
    customerEmail: 'customer1@example.com',
    createdAt: '2024-06-01T10:00:00.000Z',
    updatedAt: '2024-06-01T10:30:00.000Z',
  },
  {
    id: 'inv-002',
    storeId: 'store-001',
    store: MOCK_STORES[0],
    orderId: 'ORD-12346',
    amount: 120.0,
    currency: 'USD',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    customerEmail: 'customer2@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-003',
    storeId: 'store-001',
    store: MOCK_STORES[0],
    orderId: 'ORD-12347',
    amount: 80.0,
    currency: 'USD',
    cryptoAmount: 80.0,
    cryptoCurrency: 'USDC',
    status: 'PAID',
    paymentAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    network: 'ethereum',
    paidAt: '2024-05-31T15:45:00.000Z',
    createdAt: '2024-05-31T15:00:00.000Z',
    updatedAt: '2024-05-31T15:45:00.000Z',
  },
  {
    id: 'inv-004',
    storeId: 'store-002',
    store: MOCK_STORES[1],
    orderId: 'ORD-22001',
    amount: 25.0,
    currency: 'USD',
    cryptoAmount: 0.15,
    cryptoCurrency: 'SOL',
    status: 'CONFIRMING',
    paymentAddress: '5aP8rEFvKBxYQHAqLMGWHe9YQhxv9gLdVZaFYxVaKLzc',
    network: 'solana',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-005',
    storeId: 'store-001',
    store: MOCK_STORES[0],
    orderId: 'ORD-12348',
    amount: 200.0,
    currency: 'USD',
    status: 'EXPIRED',
    expiresAt: '2024-05-30T12:00:00.000Z',
    createdAt: '2024-05-30T11:00:00.000Z',
    updatedAt: '2024-05-30T12:00:00.000Z',
  },
  {
    id: 'inv-006',
    storeId: 'store-002',
    store: MOCK_STORES[1],
    orderId: 'ORD-22002',
    amount: 75.0,
    currency: 'USD',
    cryptoAmount: 75.0,
    cryptoCurrency: 'USDT',
    status: 'PAID',
    paymentAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    network: 'bsc',
    paidAt: '2024-05-29T09:15:00.000Z',
    createdAt: '2024-05-29T09:00:00.000Z',
    updatedAt: '2024-05-29T09:15:00.000Z',
  },
]

// Mock Wallets
export const MOCK_WALLETS: Wallet[] = [
  {
    id: 'wallet-001',
    merchantId: MOCK_MERCHANT.id,
    network: 'ethereum',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f1a812',
    balance: 5420.5,
    derivedAddressCount: 45,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  },
  {
    id: 'wallet-002',
    merchantId: MOCK_MERCHANT.id,
    network: 'bsc',
    address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    balance: 2150.25,
    derivedAddressCount: 23,
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-05-28T14:30:00.000Z',
  },
  {
    id: 'wallet-003',
    merchantId: MOCK_MERCHANT.id,
    network: 'solana',
    address: '5aP8rEFvKBxYQHAqLMGWHe9YQhxv9gLdVZaFYxVaKLzc',
    balance: 890.0,
    derivedAddressCount: 12,
    createdAt: '2024-03-10T16:45:00.000Z',
    updatedAt: '2024-06-01T09:00:00.000Z',
  },
]

// Mock API Keys
export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'apikey-001',
    storeId: 'store-001',
    name: 'Production Key',
    keyPrefix: 'pk_live_',
    permissions: ['invoices:create', 'invoices:read', 'stores:read'],
    lastUsedAt: '2024-06-01T10:30:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'apikey-002',
    storeId: 'store-001',
    name: 'Test Key',
    keyPrefix: 'pk_test_',
    permissions: ['invoices:create', 'invoices:read'],
    lastUsedAt: '2024-05-20T08:00:00.000Z',
    createdAt: '2024-02-01T12:00:00.000Z',
  },
  {
    id: 'apikey-003',
    storeId: 'store-002',
    name: 'Integration Key',
    keyPrefix: 'pk_live_',
    permissions: ['invoices:create', 'invoices:read', 'stores:read', 'currencies:read'],
    lastUsedAt: '2024-05-31T16:00:00.000Z',
    createdAt: '2024-02-20T08:30:00.000Z',
  },
  {
    id: 'apikey-004',
    storeId: 'store-001',
    name: 'Old Key (Revoked)',
    keyPrefix: 'pk_live_',
    permissions: ['invoices:read'],
    createdAt: '2024-01-01T00:00:00.000Z',
    revokedAt: '2024-03-15T00:00:00.000Z',
  },
]

// Mock Dashboard Stats
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 12450.75,
  revenueChange: 12.5,
  totalInvoices: 156,
  invoicesToday: 8,
  successRate: 98.2,
  activeStores: 2,
}

// Mock Revenue Data
export const MOCK_REVENUE_DATA: RevenueDataPoint[] = [
  { date: '2024-05-26', amount: 1200 },
  { date: '2024-05-27', amount: 1850 },
  { date: '2024-05-28', amount: 1420 },
  { date: '2024-05-29', amount: 2100 },
  { date: '2024-05-30', amount: 1680 },
  { date: '2024-05-31', amount: 2350 },
  { date: '2024-06-01', amount: 1850 },
]

// Network display names
export const NETWORK_NAMES: Record<string, string> = {
  ethereum: 'Ethereum (ERC-20)',
  bsc: 'BNB Smart Chain (BEP-20)',
  solana: 'Solana',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
}
