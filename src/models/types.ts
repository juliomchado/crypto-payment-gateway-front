// ==========================================
// USER & AUTH TYPES
// ==========================================

export type UserRole = 'USER' | 'MERCHANT' | 'ADMIN'

export type UserStatus =
  | 'UNVERIFIED'
  | 'EMAIL_VERIFIED'
  | 'KYC_LEVEL_1'
  | 'KYC_LEVEL_2'
  | 'KYC_LEVEL_3'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  country?: string
  language: string
  role: UserRole
  status: UserStatus
  emailVerifiedAt?: string
  kycCompletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ==========================================
// MERCHANT TYPES
// ==========================================

export type MerchantStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'REJECTED'
  | 'ARCHIVED'

export interface Merchant {
  id: string
  merchantName: string
  status: MerchantStatus
  businessType?: string
  registrationNumber?: string
  taxId?: string
  approvedAt?: string
  approvedBy?: string
  userId: string
  user?: User
  createdAt: string
  updatedAt: string
}

// ==========================================
// NETWORK TYPES
// ==========================================

export type NetworkType =
  | 'ETHEREUM'
  | 'ARBITRUM'
  | 'BASE'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'BINANCE_SMART_CHAIN'
  | 'SOLANA'
  | 'TRON'
  | 'BITCOIN'
  | 'LIGHTNING'
  | 'LITECOIN'
  | 'XRP'
  | 'DOGECOIN'

export type NetworkStandard =
  | 'ERC_20'
  | 'SPL'
  | 'TRC_20'
  | 'NATIVE'
  | 'BITCOIN'
  | 'LIGHTNING'

export type NetworkStatus = 'ACTIVE' | 'INACTIVE'

export interface Network {
  id: string
  name: string
  title: string
  type: NetworkType
  standard: NetworkStandard
  rpcUrl?: string
  explorerUrl?: string
  confirmations: number
  status: NetworkStatus
  createdAt: string
  updatedAt: string
}

// ==========================================
// CURRENCY TYPES
// ==========================================

export type CurrencyType = 'CRYPTO' | 'FIAT'

export type CurrencyStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED'

export interface Currency {
  id: string
  symbol: string
  title: string           // Backend uses 'title', not 'name'
  type: CurrencyType
  decimals: number
  native: boolean
  merchantPay: boolean    // Can customer pay in this currency
  merchantReceive: boolean // Can merchant receive settlement
  merchantPrice: boolean  // Can merchant set prices
  status: CurrencyStatus
  contractAddress?: string
  iconUrl?: string
  networkId: string
  network?: Network
  createdAt: string
  updatedAt: string
}

// ==========================================
// STORE TYPES
// ==========================================

export type StoreStatus = 'ACTIVE' | 'INACTIVE'

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  merchantId: string
  merchant?: Merchant
  exchangeRateSourceId: string
  status: StoreStatus
  defaultCurrency?: string
  defaultPaymentWindow: number  // seconds, 60-86400
  feePercent: number
  feeFixed: number
  feeCurrency?: string
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
  supportedCurrencies?: StoreCurrency[]
  invoiceCount?: number  // Computed field
  createdAt: string
  updatedAt: string
}

export interface StoreCurrency {
  id: string
  storeId: string
  store?: Store
  currencyId: string
  currency: Currency
  isEnabled: boolean
  minAmount: string  // Decimal as string
  maxAmount: string  // Decimal as string
  createdAt: string
  updatedAt: string
}

// ==========================================
// INVOICE TYPES
// ==========================================

export type PaymentStatus =
  | 'PENDING'
  | 'DETECTING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'OVERPAID'
  | 'UNDERPAID'
  | 'EXPIRED'
  | 'FAILED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'CANCELLED'

// Legacy status type for backward compatibility
export type InvoiceStatus = PaymentStatus

export interface InvoiceRate {
  currencyId: string
  networkId: string
  rate: string          // Decimal as string for precision
  payerAmount: string   // Amount in crypto with 18 decimals precision
}

export interface Invoice {
  id: string
  storeId: string
  store?: Store
  orderId: string
  amount: string              // Decimal as string
  currency: string            // ISO currency code (USD, EUR, etc)
  title?: string
  description?: string

  // Payment details
  networkId?: string
  network?: Network
  addressId?: string
  paymentAddress?: string

  // Crypto payment info
  payer_currency?: string     // Cryptocurrency symbol
  payer_amount?: string       // Amount to pay in crypto
  payer_amount_usd?: string   // Crypto amount in USD
  payment_amount?: string     // Actual amount received
  payment_amount_fiat?: string // Received amount in fiat

  // Merchant settlement
  merchantAmount?: string
  merchantCurrency?: string
  exchangeRate?: string

  // Status
  paymentStatus: PaymentStatus
  isFinal: boolean
  isPaymentMultiple: boolean
  accuracyPaymentPercent: number
  subtract: number            // Commission percentage charged to client

  // URLs
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string

  // Metadata
  additionalData?: Record<string, unknown>
  fromReferralCode?: string
  customerEmail?: string

  // Timestamps
  expiresAt: string
  paidAt?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string

  // Exchange rates snapshot
  rates?: InvoiceRate[]

  // Legacy fields for backward compatibility
  cryptoAmount?: string
  cryptoCurrency?: string
  status?: PaymentStatus  // Alias for paymentStatus
}

// ==========================================
// WALLET TYPES
// ==========================================

export type WalletChainType = 'EVM' | 'BITCOIN' | 'SOLANA'

// Alias for wallet service compatibility
export type ChainType = WalletChainType

export type WalletType = 'MASTER' | 'HOT' | 'COLD' | 'FEE' | 'SETTLEMENT'

export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'DRAINED'

export interface Wallet {
  id: string
  merchantId: string
  merchant?: Merchant
  chainType: WalletChainType
  type: WalletType
  status: WalletStatus
  publicKey: string
  derivationPath: string
  nextAddressIndex: number
  addresses?: Address[]
  createdAt: string
  updatedAt: string
}

export type AddressStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'USED'
  | 'EXPIRED'
  | 'COMPROMISED'

export interface Address {
  id: string
  address: string
  derivationIndex: number
  status: AddressStatus
  totalReceived: string
  totalWithdrawn: string
  masterWalletId: string
  masterWallet?: Wallet
  invoiceId?: string
  invoice?: Invoice
  createdAt: string
  updatedAt: string
}

// Legacy type alias
export interface DerivedAddress {
  id: string
  walletId: string
  address: string
  index: number
  isUsed: boolean
  createdAt: string
}

// ==========================================
// API KEY TYPES
// ==========================================

export type ApiKeyType = 'PAYMENT' | 'PAYOUT'

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED'

export interface ApiKey {
  id: string
  name: string
  type: ApiKeyType
  key?: string            // Full key (only on creation)
  keyHint: string         // Last 4 characters for display
  status: ApiKeyStatus
  storeId: string
  store?: Store
  userId: string
  user?: User
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// EXCHANGE RATE TYPES
// ==========================================

export type ExchangeRateSourceStatus = 'ACTIVE' | 'INACTIVE'

export interface ExchangeRateSource {
  id: string
  provider: string
  url?: string
  priority: number
  status: ExchangeRateSourceStatus
  createdAt: string
  updatedAt: string
}

// ==========================================
// MERCHANT BALANCE TYPES
// ==========================================

export interface MerchantBalance {
  id: string
  merchantId: string
  currencyId: string
  currency?: Currency
  networkId: string
  network?: Network
  availableBalance: string
  pendingBalance: string
  lockedBalance: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// WITHDRAWAL TYPES
// ==========================================

export type WithdrawalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'BROADCASTED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'

export interface Withdrawal {
  id: string
  merchantId: string
  merchant?: Merchant
  currencyId: string
  currency?: Currency
  amount: string
  fee: string
  toAddress: string
  txId?: string
  status: WithdrawalStatus
  createdAt: string
  updatedAt: string
}

// ==========================================
// TRANSACTION TYPES
// ==========================================

export type TransactionStatus =
  | 'DETECTED'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'DROPPED'
  | 'REPLACED'

export interface Transaction {
  id: string
  txId: string
  txUrl?: string
  fromAddress: string
  toAddress: string
  amount: string
  currency: string
  blockNumber?: number
  blockHash?: string
  transactionIndex?: number
  status: TransactionStatus
  metadata?: Record<string, unknown>
  invoiceId?: string
  invoice?: Invoice
  networkId: string
  network?: Network
  createdAt: string
  updatedAt: string
}

// ==========================================
// DASHBOARD TYPES
// ==========================================

export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalInvoices: number
  invoicesToday: number
  successRate: number
  activeStores: number
}

export interface RevenueDataPoint {
  date: string
  amount: number
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Helper to get display name from User
export function getUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

// Helper to check if invoice is in terminal state
export function isInvoiceFinal(status: PaymentStatus): boolean {
  return ['CONFIRMED', 'EXPIRED', 'FAILED', 'REFUNDED', 'CANCELLED'].includes(status)
}

// Helper to map legacy status to new PaymentStatus
export function mapLegacyStatus(status: string): PaymentStatus {
  const mapping: Record<string, PaymentStatus> = {
    'AWAITING_PAYMENT': 'PENDING',
    'PAID': 'CONFIRMED',
  }
  return (mapping[status] || status) as PaymentStatus
}

// Webhook Events
export type WebhookEventType =
  | 'payment.created'
  | 'payment.detecting'
  | 'payment.confirming'
  | 'payment.confirmed'
  | 'payment.overpaid'
  | 'payment.underpaid'
  | 'payment.expired'
  | 'payment.failed'
  | 'payment.refunding'
  | 'payment.refunded'
  | 'payment.cancelled'

export type WebhookEventStatus = 'PENDING' | 'DELIVERED' | 'FAILED'

export interface WebhookEvent {
  id: string
  storeId: string
  invoiceId: string
  event: WebhookEventType
  url: string
  payload: Record<string, unknown>
  response?: {
    status: number
    body: string
  }
  attempts: number
  maxAttempts: number
  status: WebhookEventStatus
  nextRetryAt?: string
  deliveredAt?: string
  failedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
  invoice?: Invoice
  store?: Store
}
