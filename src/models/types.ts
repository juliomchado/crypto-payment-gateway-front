// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MERCHANT' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Merchant Types
export interface Merchant {
  id: string
  name: string
  userId: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

// Store Types
export interface Store {
  id: string
  name: string
  merchantId: string
  isActive: boolean
  invoiceCount: number
  createdAt: string
  updatedAt: string
}

export interface StoreCurrency {
  id: string
  storeId: string
  currencyId: string
  currency: Currency
  minAmount: number
  maxAmount: number
  isEnabled: boolean
}

// Currency Types
export interface Currency {
  id: string
  symbol: string
  name: string
  network: string
  contractAddress?: string
  decimals: number
  iconUrl?: string
}

// Invoice Types
export type InvoiceStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMING'
  | 'PAID'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface Invoice {
  id: string
  storeId: string
  store?: Store
  orderId: string
  amount: number
  currency: string
  cryptoAmount?: number
  cryptoCurrency?: string
  status: InvoiceStatus
  paymentAddress?: string
  network?: string
  expiresAt?: string
  paidAt?: string
  customerEmail?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Wallet Types
export interface Wallet {
  id: string
  merchantId: string
  network: string
  address: string
  balance: number
  derivedAddressCount: number
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

// API Key Types
export interface ApiKey {
  id: string
  storeId: string
  name: string
  keyPrefix: string
  permissions: string[]
  lastUsedAt?: string
  createdAt: string
  revokedAt?: string
}

// Dashboard Types
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

// API Response Types
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
