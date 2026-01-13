// ==========================================
// TYPES SYNCHRONIZED WITH BACKEND
// Last updated: 2026-01-10
// Backend Prisma Schema version: latest
// ==========================================

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
  ipAddress?: string
  userAgent?: string
  merchantId?: string
  merchant?: Merchant
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
  | 'AVALANCHE'  // ✅ ADDED
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
  | 'LITECOIN'  // ✅ ADDED
  | 'XRP'       // ✅ ADDED
  | 'DOGECOIN'  // ✅ ADDED

export type NetworkStatus =
  | 'ACTIVE'
  | 'MAINTENANCE'  // ✅ CHANGED from INACTIVE
  | 'DISABLED'     // ✅ ADDED

export interface Network {
  id: string
  name: string
  title: string
  type: NetworkType
  standard: NetworkStandard
  rpcUrl?: string
  rpcUrlBackup?: string      // ✅ ADDED
  rpcUrlTestNet?: string     // ✅ ADDED
  wsUrl?: string             // ✅ ADDED
  explorerUrl?: string
  explorerUrlTestNet?: string // ✅ ADDED
  derivationPath: string     // ✅ ADDED (required)
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
  title: string
  type: CurrencyType
  decimals: number
  native: boolean
  merchantPay: boolean
  merchantReceive: boolean
  merchantPrice: boolean
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
  // REMOVED: defaultPaymentWindow - doesn't exist in backend
  feePercent: number
  feeFixed: number
  feeCurrency?: string
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
  supportedCurrencies?: StoreCurrency[]
  invoiceCount?: number
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
  minAmount: string
  maxAmount: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// NETWORK CONSTANTS
// ==========================================

export const NETWORK_NAMES: Record<string, string> = {
  ethereum: 'Ethereum',
  bsc: 'BSC',
  polygon: 'Polygon',
  bitcoin: 'Bitcoin',
  solana: 'Solana',
}

// ==========================================
// INVOICE TYPES
// ==========================================

export type PaymentStatus =
  | 'PENDING'
  | 'DETECTED'    // ✅ CHANGED from DETECTING
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'OVERPAID'
  | 'UNDERPAID'
  | 'EXPIRED'
  | 'FAILED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'CANCELLED'

export interface InvoiceRate {
  currencyId: string
  networkId: string
  rate: string
  payerAmount: string
}

export interface Invoice {
  id: string
  storeId: string
  store?: Store
  orderId: string
  amount: string  // Decimal as string
  currency: string
  title?: string
  description?: string
  customerEmail?: string
  status: PaymentStatus  // ✅ CHANGED: backend uses 'status', not 'paymentStatus'
  isFinal: boolean
  isPaymentMultiple: boolean
  accuracyPaymentPercent: number  // 0-5 (not 0-100!)
  subtract: number
  additionalData?: Record<string, unknown>
  fromReferralCode?: string
  urlCallback?: string
  urlReturn?: string
  urlSuccess?: string
  rates?: InvoiceRate[]
  // Payment address fields (set after generating address)
  networkId?: string
  paymentAddress?: string
  payer_currency?: string
  payer_amount?: string
  payer_amount_usd?: string
  // Payment tracking fields from backend
  payment_amount?: string  // ✅ ADDED: Actual amount paid
  payment_amount_fiat?: string  // ✅ ADDED: Fiat equivalent
  merchantAmount?: string  // ✅ ADDED: Amount merchant receives
  merchantCurrency?: string  // ✅ ADDED: Merchant's currency
  exchangeRate?: string  // ✅ ADDED: Rate used for conversion
  paidAt?: string  // ✅ ADDED: When payment was detected
  confirmedAt?: string  // ✅ ADDED: When payment was confirmed
  // Legacy fields for backward compatibility
  cryptoCurrency?: string
  cryptoAmount?: string
  exchangeRateSourceId?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// WALLET & ADDRESS TYPES
// ==========================================

export type WalletType = 'HOT' | 'COLD'

export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

// ✅ IMPORTANT: Backend Prisma uses NetworkStandard for chainType
// But validation schemas use this simplified enum
export type ChainType = 'EVM' | 'BITCOIN' | 'SOLANA'

export interface Wallet {
  id: string
  merchantId: string
  merchant?: Merchant
  chainType: ChainType
  type: WalletType
  status: WalletStatus
  publicKey: string
  // privateKey and mnemonic are NEVER sent to frontend (security)
  derivationPath: string
  nextAddressIndex: number
  addresses?: Address[]
  createdAt: string
  updatedAt: string
}

// ✅ FIXED: Match backend Prisma enum exactly
export type AddressStatus =
  | 'AVAILABLE'   // Address generated but not assigned
  | 'ASSIGNED'    // Assigned to an invoice (was 'RESERVED')
  | 'USED'        // Payment received (was 'IN_USE')
  | 'EXPIRED'     // Invoice expired without payment
  | 'COMPROMISED' // Security issue (was 'ARCHIVED')

export interface Address {
  id: string
  address: string
  derivationIndex: number
  status: AddressStatus
  totalReceived: string  // Decimal as string
  totalWithdrawn: string // Decimal as string
  masterWalletId: string
  masterWallet?: Wallet
  invoiceId?: string
  invoice?: Invoice
  createdAt: string
  updatedAt: string
}

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

export type ApiKeyType = 'PAYMENT' | 'PAYOUT'  // ✅ FIXED: Removed 'FULL_ACCESS' (not in backend)

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED'  // ✅ FIXED: Removed 'EXPIRED' (not in backend)

export interface ApiKey {
  id: string
  storeId: string
  store?: Store
  name: string
  key: string
  type: ApiKeyType
  status: ApiKeyStatus
  // ✅ REMOVED: permissions field doesn't exist in backend
  // ✅ REMOVED: expiresAt field doesn't exist in backend
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// WEBHOOK TYPES
// ==========================================

export type WebhookEventType =
  | 'payment.created'
  | 'payment.detected'
  | 'payment.confirming'
  | 'payment.confirmed'
  | 'payment.overpaid'
  | 'payment.underpaid'
  | 'payment.expired'
  | 'payment.failed'
  | 'payment.refunding'
  | 'payment.refunded'
  | 'payment.cancelled'

export type WebhookDeliveryStatus =
  | 'PENDING'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRYING'              // ✅ ADDED
  | 'MAX_RETRIES_EXCEEDED'  // ✅ ADDED

export interface WebhookEvent {
  id: string
  storeId: string
  store?: Store
  invoiceId: string
  invoice?: Invoice
  eventType: WebhookEventType  // ✅ CHANGED: matches backend
  endpointUrl: string          // ✅ CHANGED: matches backend
  signature?: string
  statusCode?: number          // ✅ CHANGED: matches backend
  requestPayload: Record<string, unknown>  // ✅ CHANGED: matches backend
  responseBody?: string        // ✅ CHANGED: matches backend
  errorMessage?: string
  deliveredAt?: string
  lastAttemptAt?: string
  nextRetryAt?: string
  attemptCount: number
  maxRetries: number
  lastError?: string
  status: WebhookDeliveryStatus
  createdAt: string
  updatedAt: string
}

// ==========================================
// EXCHANGE RATE TYPES
// ==========================================

export type ExchangeRateSourceStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ERROR'  // ✅ ADDED

export interface ExchangeRateSource {
  id: string
  name: string
  url?: string
  apiKey?: string
  priority: number
  status: ExchangeRateSourceStatus
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
  revenue: number
}

// ==========================================
// PAYMENT PAGE TYPES
// ==========================================

export interface PaymentPageData {
  invoice: Invoice
  currencies: Currency[]
  networks: Network[]
  store: Store
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// ==========================================
// FORM TYPES
// ==========================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  country?: string
}
