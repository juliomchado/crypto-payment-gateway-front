# Backend API Documentation - Complete Route Reference

## Overview
This document provides a comprehensive reference of all API routes in the crypto payment gateway backend. This will serve as the authoritative guide for frontend-backend integration.

**Backend:** Fastify 5.6.1 with TypeScript
**Database:** PostgreSQL with Prisma ORM
**Authentication:** JWT + API Key (HMAC-SHA256 signatures)
**Base URL:** `http://localhost:3001` (development)

---

## Authentication Methods

### 1. JWT Authentication
- **Usage:** User-initiated actions in the frontend
- **Token Location:** HTTP-only secure cookie + Authorization header
- **Expiration:** 7 days
- **Header Format:** `Authorization: Bearer <token>`
- **Payload:** `{ sub: userId, role: "USER" | "ADMIN" | "SUPER_ADMIN" }`

### 2. API Key Authentication
- **Usage:** Server-to-server integration
- **Required Headers:**
  ```json
  {
    "sign": "SHA256 HMAC hash of request body",
    "store": "UUID of store"
  }
  ```
- **Signature Algorithm:** HMAC-SHA256 of JSON payload using API secret

### 3. Multi-Auth
- **Usage:** Endpoints that accept both JWT and API Key
- **Detection:** Automatic based on headers present

### 4. Admin Role Check
- **Usage:** Admin-only endpoints
- **Requires:** JWT auth + role = `ADMIN` or `SUPER_ADMIN`

---

## 1. AUTHENTICATION ROUTES

### POST /auth/login
**Authentication:** None (public)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "MyP@ssw0rd"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "019b7624-1060-74be-9920-a19f77ba5675",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Purpose:** Authenticate user and receive JWT token
**Notes:**
- Sets HTTP-only secure cookie with JWT
- Password must be 8+ chars with uppercase, lowercase, number, special char
- Returns 401 if credentials invalid

---

### POST /auth/register
**Authentication:** None (public)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "MyP@ssw0rd",
  "firstName": "John",
  "lastName": "Doe",
  "country": "United States",
  "language": "en"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "019b7624-1060-74be-9920-a19f77ba5675",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "language": "en",
    "country": "United States",
    "role": "USER",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Purpose:** Register new user account
**Notes:**
- Sends verification email with 6-digit code
- Password requirements: 8+ chars, uppercase, lowercase, number, special char
- Returns 400 if email already exists

---

### GET /auth/me
**Authentication:** JWT required

**Response (200):**
```json
{
  "id": "019b7624-1060-74be-9920-a19f77ba5675",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "merchant": {
    "id": "019b7624-2222-74be-9920-a19f77ba5675",
    "name": "Acme Payments Inc.",
    "status": "APPROVED",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Purpose:** Get current authenticated user profile
**Notes:** Returns merchant info if user is a merchant

---

### POST /auth/forgot-password
**Authentication:** None (public)

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "A password reset link will be sent to your email address if it is associated with an active account."
}
```

**Purpose:** Initiate password recovery process
**Notes:**
- Generic response to prevent email enumeration
- Sends 6-digit reset token via email
- Constant-time response (1 second delay)

---

### POST /auth/reset-password
**Authentication:** None (public)

**Request:**
```json
{
  "token": "123456",
  "password": "NewP@ssw0rd"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Purpose:** Reset password using recovery token
**Notes:**
- Token must be 6 characters
- Password validated same as registration
- Token expires after use or timeout

---

### POST /auth/verify-email
**Authentication:** None (public)

**Request:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Purpose:** Verify user email address
**Notes:** Token is 6-character code sent via email

---

## 2. MERCHANT ROUTES

### POST /merchants
**Authentication:** JWT required

**Request:**
```json
{
  "merchantName": "Acme Payments Inc.",
  "businessType": "E-commerce",
  "registrationNumber": "123456789",
  "taxId": "TAX-123456"
}
```

**Response (201):**
```json
{
  "id": "019b7624-3333-74be-9920-a19f77ba5675",
  "name": "Acme Payments Inc.",
  "businessType": "E-commerce",
  "registrationNumber": "123456789",
  "taxId": "TAX-123456",
  "status": "PENDING",
  "userId": "019b7624-1060-74be-9920-a19f77ba5675",
  "wallets": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Create new merchant entity
**Notes:** Creates associated wallets for chain types (EVM, BITCOIN, SOLANA)

---

### GET /merchants
**Authentication:** JWT + Admin role

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 20)
- `status`: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

**Response (200):**
```json
{
  "merchants": [
    {
      "id": "019b7624-3333-74be-9920-a19f77ba5675",
      "name": "Acme Inc.",
      "businessType": "E-commerce",
      "status": "APPROVED",
      "userId": "019b7624-1060-74be-9920-a19f77ba5675",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

**Purpose:** List all merchants with pagination
**Notes:** Admin-only endpoint

---

### GET /merchants/:id
**Authentication:** JWT required

**Response (200):**
```json
{
  "id": "019b7624-3333-74be-9920-a19f77ba5675",
  "name": "Acme Payments Inc.",
  "businessType": "E-commerce",
  "registrationNumber": "123456789",
  "taxId": "TAX-123456",
  "status": "APPROVED",
  "userId": "019b7624-1060-74be-9920-a19f77ba5675",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get specific merchant details
**Notes:** Users can view their own merchant; admins can view any

---

### PATCH /merchants/:id
**Authentication:** JWT required

**Request (all fields optional):**
```json
{
  "merchantName": "Updated Name",
  "businessType": "Retail",
  "registrationNumber": "987654321",
  "taxId": "TAX-654321"
}
```

**Response (200):** Updated merchant object

**Purpose:** Update merchant profile information
**Notes:** Only owner or admin can update

---

### PATCH /merchants/:id/status
**Authentication:** JWT + Admin role

**Request:**
```json
{
  "status": "APPROVED"
}
```

**Values:** "APPROVED" | "PENDING" | "REJECTED" | "SUSPENDED"

**Response (200):** Updated merchant object

**Purpose:** Modify merchant account status
**Notes:** Admin-only operation

---

### DELETE /merchants/:id
**Authentication:** JWT + Admin role

**Response (204):** No content

**Purpose:** Delete merchant profile
**Notes:** Admin-only; affects related store operations

---

## 3. STORE ROUTES

### POST /stores
**Authentication:** JWT required

**Request:**
```json
{
  "name": "My Store",
  "slug": "my-store",
  "description": "My awesome online store"
}
```

**Response (201):**
```json
{
  "store": {
    "id": "019b7624-4444-74be-9920-a19f77ba5675",
    "name": "My Store",
    "slug": "my-store",
    "description": "My awesome online store",
    "status": "ACTIVE",
    "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
    "defaultCurrency": "USD",
    "feePercent": 0,
    "feeFixed": 0,
    "feeCurrency": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "apiKeys": {
    "payment": "pk_live_abc123def456..."
  }
}
```

**Purpose:** Create new store instance
**Notes:** Returns payment API key automatically generated

---

### GET /stores
**Authentication:** JWT required

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 20)
- `merchantId`: UUID (optional)
- `status`: "ACTIVE" | "INACTIVE" (optional)

**Response (200):**
```json
{
  "stores": [
    {
      "id": "019b7624-4444-74be-9920-a19f77ba5675",
      "name": "My Store",
      "slug": "my-store",
      "status": "ACTIVE",
      "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

**Purpose:** List stores with filtering
**Notes:** Users see their stores; admins see all

---

### GET /stores/:id
**Authentication:** JWT required

**Response (200):**
```json
{
  "id": "019b7624-4444-74be-9920-a19f77ba5675",
  "name": "My Store",
  "slug": "my-store",
  "description": "My awesome online store",
  "status": "ACTIVE",
  "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
  "defaultCurrency": "USD",
  "feePercent": 2.5,
  "feeFixed": 0.5,
  "feeCurrency": "USDT",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get store configuration and profile data

---

### PATCH /stores/:id
**Authentication:** JWT required

**Request (all fields optional):**
```json
{
  "name": "Updated Store",
  "description": "Updated description",
  "status": "ACTIVE",
  "defaultCurrency": "USDT",
  "feePercent": 2.5,
  "feeFixed": 0.5,
  "feeCurrency": "USDT"
}
```

**Response (200):** Updated store object

**Purpose:** Update store configuration

---

### DELETE /stores/:id
**Authentication:** JWT + Admin role

**Response (204):** No content

**Purpose:** Soft delete store
**Notes:** Prevents further transactions but preserves data

---

### GET /stores/:id/currencies
**Authentication:** None (public)

**Response (200):**
```json
[
  {
    "currencyId": "019b7624-5555-74be-9920-a19f77ba5675",
    "currency": {
      "id": "019b7624-5555-74be-9920-a19f77ba5675",
      "title": "Bitcoin",
      "symbol": "BTC",
      "type": "CRYPTOCURRENCY",
      "native": true,
      "networks": [
        {
          "id": "019b7624-6666-74be-9920-a19f77ba5675",
          "name": "bitcoin",
          "title": "Bitcoin Network",
          "standard": "BITCOIN"
        }
      ]
    },
    "isEnabled": true,
    "minAmount": "0.0001",
    "maxAmount": "10"
  }
]
```

**Purpose:** Get available payment currencies for store
**Notes:** Public endpoint used by payment widget

---

### PUT /stores/:id/currencies
**Authentication:** JWT required

**Request:**
```json
{
  "currencyId": "019b7624-5555-74be-9920-a19f77ba5675",
  "isEnabled": true,
  "minAmount": "10",
  "maxAmount": "10000"
}
```

**Response (200):**
```json
{
  "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
  "currencyId": "019b7624-5555-74be-9920-a19f77ba5675",
  "isEnabled": true,
  "minAmount": "10",
  "maxAmount": "10000",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Add or update currency configuration for store

---

## 4. INVOICE ROUTES

### POST /v1/invoice/:storeId
**Authentication:** JWT required

**Request:**
```json
{
  "amount": "100.50",
  "orderId": "ORD-99283",
  "currency": "USD",
  "lifespan": 3600,
  "isPaymentMultiple": false,
  "accuracyPaymentPercent": 0,
  "additionalData": {
    "internal_ref": "xyz",
    "customer_id": "123"
  },
  "fromReferralCode": "REF-55",
  "title": "MyShop Order #12345",
  "description": "1 x Apple iPhone 15",
  "urlCallback": "https://merchant.com/webhook",
  "urlReturn": "https://merchant.com/return",
  "urlSuccess": "https://merchant.com/success"
}
```

**Field Details:**
- `amount`: String, payment amount in specified currency
- `orderId`: String, merchant's order reference
- `currency`: String, currency code (USD, EUR, etc.)
- `lifespan`: Number, seconds until expiration (5-43200)
- `isPaymentMultiple`: Boolean, allow multiple partial payments
- `accuracyPaymentPercent`: Number, payment tolerance percentage (0-100)
- `additionalData`: Object, custom metadata
- `fromReferralCode`: String (optional), referral tracking
- `title`: String, invoice title
- `description`: String, invoice description
- `urlCallback`: String, webhook URL for payment notifications
- `urlReturn`: String, redirect URL when user returns
- `urlSuccess`: String, redirect URL on successful payment

**Response (201):**
```json
{
  "id": "019b7624-7777-74be-9920-a19f77ba5675",
  "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
  "orderId": "ORD-99283",
  "amount": "100.50",
  "currency": "USD",
  "status": "PENDING",
  "title": "MyShop Order #12345",
  "description": "1 x Apple iPhone 15",
  "lifespan": 3600,
  "expiresAt": "2024-01-01T01:00:00Z",
  "isPaymentMultiple": false,
  "accuracyPaymentPercent": 0,
  "additionalData": {
    "internal_ref": "xyz",
    "customer_id": "123"
  },
  "urlCallback": "https://merchant.com/webhook",
  "urlReturn": "https://merchant.com/return",
  "urlSuccess": "https://merchant.com/success",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "rates": [
    {
      "currencyId": "019b7624-5555-74be-9920-a19f77ba5675",
      "currency": {
        "symbol": "BTC",
        "title": "Bitcoin"
      },
      "rate": "0.0000234",
      "payerAmount": "0.00235234"
    }
  ]
}
```

**Purpose:** Create payment invoice
**Notes:** Locks exchange rates at creation time

---

### POST /api/v1/invoice
**Authentication:** API key required

**Headers:**
```json
{
  "sign": "SHA256 HMAC hash of request body",
  "store": "019b7624-4444-74be-9920-a19f77ba5675"
}
```

**Request:** Same as POST /v1/invoice/:storeId (without storeId in path)

**Response (201):** Same as above

**Purpose:** Create invoice via API key (server-to-server)
**Notes:** Used for backend integration

---

### POST /v1/invoice/:id/address
**Authentication:** None (public)

**Request:**
```json
{
  "token": "ETH",
  "network": "ERC_20"
}
```

**Response (200):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "amount": "0.054321",
  "currency": "ETH",
  "network": "ERC_20",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

**Purpose:** Generate blockchain address for payment
**Notes:** Derives fresh address from merchant's HD wallet

---

### GET /v1/invoice
**Authentication:** Multi-auth (JWT or API key)

**Query Parameters:**
- `merchantId`: UUID (optional, JWT only)
- `storeId`: UUID (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `status`: "PENDING" | "PROCESSING" | "CONFIRMED" | "EXPIRED" | "CANCELLED"

**Response (200):**
```json
{
  "data": [
    {
      "id": "019b7624-7777-74be-9920-a19f77ba5675",
      "orderId": "ORD-99283",
      "amount": "100.50",
      "currency": "USD",
      "status": "PENDING",
      "title": "MyShop Order #12345",
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-01T01:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Purpose:** List invoices with filtering
**Notes:** API key users limited to their store

---

### GET /v1/invoice/:id
**Authentication:** None (public)

**Response (200):**
```json
{
  "id": "019b7624-7777-74be-9920-a19f77ba5675",
  "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
  "orderId": "ORD-99283",
  "amount": "100.50",
  "currency": "USD",
  "status": "PENDING",
  "title": "MyShop Order #12345",
  "description": "1 x Apple iPhone 15",
  "lifespan": 3600,
  "expiresAt": "2024-01-01T01:00:00Z",
  "isPaymentMultiple": false,
  "accuracyPaymentPercent": 0,
  "additionalData": {},
  "urlReturn": "https://merchant.com/return",
  "urlSuccess": "https://merchant.com/success",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "rates": [...]
}
```

**Purpose:** Get specific invoice details

---

### GET /v1/invoice/:id/status
**Authentication:** Multi-auth (JWT or API key)

**Response (200):**
```json
{
  "id": "019b7624-7777-74be-9920-a19f77ba5675",
  "status": "PROCESSING",
  "amount": "100.50",
  "paidAmount": "0.054321",
  "currency": "USD",
  "paidCurrency": "ETH",
  "confirmations": 3,
  "requiredConfirmations": 12,
  "expiresAt": "2024-01-01T01:00:00Z",
  "updatedAt": "2024-01-01T00:15:00Z"
}
```

**Purpose:** Get current invoice status and payment progress
**Notes:** Updated based on blockchain confirmations

---

### GET /v1/invoice/:id/transactions
**Authentication:** Multi-auth (JWT or API key)

**Query Parameters:**
- `txHash`: string (optional, filter by transaction hash)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "019b7624-8888-74be-9920-a19f77ba5675",
      "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
      "txHash": "0xabc123...",
      "fromAddress": "0x123...",
      "toAddress": "0x742d35Cc...",
      "amount": "0.054321",
      "currency": "ETH",
      "network": "ERC_20",
      "confirmations": 3,
      "status": "CONFIRMING",
      "blockNumber": 18234567,
      "blockTimestamp": "2024-01-01T00:10:00Z",
      "createdAt": "2024-01-01T00:11:00Z"
    }
  ]
}
```

**Purpose:** Get blockchain transactions for invoice
**Notes:** Can filter by specific transaction hash

---

## 5. API KEY ROUTES

### POST /store/:storeId/api-keys
**Authentication:** JWT required

**Request:**
```json
{
  "name": "Production Payment Key",
  "type": "PAYMENT"
}
```

**Response (201):**
```json
{
  "id": "019b7624-9999-74be-9920-a19f77ba5675",
  "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
  "name": "Production Payment Key",
  "type": "PAYMENT",
  "key": "pk_live_abc123def456...",
  "secret": "sk_live_xyz789uvw456...",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Generate new API key for store
**Notes:** Secret shown only once; store securely

---

### GET /store/:storeId/api-keys
**Authentication:** JWT required

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 20)
- `status`: "ACTIVE" | "REVOKED"

**Response (200):**
```json
{
  "data": [
    {
      "id": "019b7624-9999-74be-9920-a19f77ba5675",
      "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
      "name": "Production Payment Key",
      "type": "PAYMENT",
      "key": "pk_live_abc123...",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastUsedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 5
}
```

**Purpose:** List store API keys
**Notes:** Does not return secrets (masked)

---

### PATCH /store/:storeId/api-keys/:apiKeyId/revoke
**Authentication:** JWT + Admin role

**Response (200):**
```json
{
  "id": "019b7624-9999-74be-9920-a19f77ba5675",
  "status": "REVOKED",
  "revokedAt": "2024-01-01T13:00:00Z"
}
```

**Purpose:** Revoke existing API key
**Notes:** Immediately invalidates key

---

### PATCH /store/:storeId/api-keys/:apiKeyId/rotate
**Authentication:** JWT required

**Response (200):**
```json
{
  "old": {
    "id": "019b7624-9999-74be-9920-a19f77ba5675",
    "status": "REVOKED"
  },
  "new": {
    "id": "019b7624-aaaa-74be-9920-a19f77ba5675",
    "key": "pk_live_new123...",
    "secret": "sk_live_new456...",
    "status": "ACTIVE"
  }
}
```

**Purpose:** Rotate API key (revoke old, create new)
**Notes:** Atomic operation; new secret shown only once

---

## 6. USER ROUTES

### GET /users
**Authentication:** JWT + Admin role

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 20)

**Response (200):**
```json
{
  "users": [
    {
      "id": "019b7624-1060-74be-9920-a19f77ba5675",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150
}
```

**Purpose:** List all system users
**Notes:** Admin-only

---

### GET /users/:id
**Authentication:** JWT required

**Response (200):**
```json
{
  "id": "019b7624-1060-74be-9920-a19f77ba5675",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "country": "United States",
  "language": "en",
  "role": "USER",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get specific user details
**Notes:** Users view own profile; admins view any

---

### PATCH /users/:id
**Authentication:** JWT required

**Request (all fields optional):**
```json
{
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "country": "United States",
  "language": "en"
}
```

**Response (200):** Updated user object

**Purpose:** Update user profile
**Notes:** Users update own profile; email change requires reverification

---

### PATCH /users/:id/role
**Authentication:** JWT + Admin role

**Request:**
```json
{
  "role": "ADMIN"
}
```

**Values:** "USER" | "ADMIN" | "SUPER_ADMIN"

**Response (200):** Updated user object

**Purpose:** Update user role
**Notes:** Admin-only; affects system access levels

---

### DELETE /users/:id
**Authentication:** JWT + Admin role

**Response (204):** No content

**Purpose:** Remove user account permanently
**Notes:** Admin-only; deletes all associated data

---

## 7. WALLET ROUTES

### POST /wallets
**Authentication:** None (public)

**Request:**
```json
{
  "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
  "chainType": "EVM"
}
```

**Chain Types:** "EVM" | "BITCOIN" | "SOLANA"

**Response (201):**
```json
{
  "id": "019b7624-bbbb-74be-9920-a19f77ba5675",
  "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
  "chainType": "EVM",
  "type": "HD_WALLET",
  "status": "ACTIVE",
  "masterPublicKey": "xpub6D4BDPcP2GT577Vv...",
  "derivationPath": "m/44'/60'/0'/0",
  "nextAddressIndex": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Create master HD wallet for merchant
**Notes:** Initiates multi-chain asset management; private keys never exposed

---

### GET /wallets/:id
**Authentication:** None (public)

**Response (200):**
```json
{
  "id": "019b7624-bbbb-74be-9920-a19f77ba5675",
  "merchantId": "019b7624-3333-74be-9920-a19f77ba5675",
  "chainType": "EVM",
  "type": "HD_WALLET",
  "status": "ACTIVE",
  "masterPublicKey": "xpub6D4BDPcP2GT577Vv...",
  "derivationPath": "m/44'/60'/0'/0",
  "nextAddressIndex": 42,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get wallet metadata
**Notes:** Does not expose private keys; public endpoint

---

### GET /wallets/merchant/:merchantId
**Authentication:** None (public)

**Response (200):**
```json
{
  "wallets": [
    {
      "id": "019b7624-bbbb-74be-9920-a19f77ba5675",
      "chainType": "EVM",
      "status": "ACTIVE",
      "nextAddressIndex": 42
    },
    {
      "id": "019b7624-cccc-74be-9920-a19f77ba5675",
      "chainType": "BITCOIN",
      "status": "ACTIVE",
      "nextAddressIndex": 15
    }
  ]
}
```

**Purpose:** List merchant's wallets
**Notes:** Used for multi-chain operations

---

### POST /wallets/:id/derive
**Authentication:** None (public)

**Request:**
```json
{
  "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675"
}
```

**Response (200):**
```json
{
  "id": "019b7624-dddd-74be-9920-a19f77ba5675",
  "walletId": "019b7624-bbbb-74be-9920-a19f77ba5675",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "derivationIndex": 42,
  "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Generate fresh blockchain address from wallet
**Notes:** Ensures unique address per transaction

---

### GET /addresses/:id
**Authentication:** None (public)

**Response (200):**
```json
{
  "id": "019b7624-dddd-74be-9920-a19f77ba5675",
  "walletId": "019b7624-bbbb-74be-9920-a19f77ba5675",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "derivationIndex": 42,
  "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get address details with metadata

---

### GET /addresses/lookup/:address
**Authentication:** None (public)

**Path Parameter:** `address` (blockchain address string)

**Response (200):**
```json
{
  "id": "019b7624-dddd-74be-9920-a19f77ba5675",
  "walletId": "019b7624-bbbb-74be-9920-a19f77ba5675",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "derivationIndex": 42,
  "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
  "invoice": {
    "id": "019b7624-7777-74be-9920-a19f77ba5675",
    "orderId": "ORD-99283",
    "storeId": "019b7624-4444-74be-9920-a19f77ba5675"
  }
}
```

**Purpose:** Link blockchain address to system records
**Notes:** Essential for identifying incoming transactions

---

## 8. NETWORK ROUTES

### GET /networks/active
**Authentication:** None (public)

**Response (200):**
```json
{
  "networks": [
    {
      "id": "019b7624-eeee-74be-9920-a19f77ba5675",
      "name": "ethereum",
      "title": "Ethereum Mainnet",
      "type": "ETHEREUM",
      "standard": "ERC_20",
      "confirmations": 12,
      "explorerUrl": "https://etherscan.io",
      "status": "ACTIVE"
    }
  ]
}
```

**Purpose:** Get available blockchain networks
**Notes:** Public endpoint for integration info

---

### POST /networks
**Authentication:** JWT + Admin role

**Request:**
```json
{
  "name": "ethereum",
  "title": "Ethereum Mainnet",
  "type": "ETHEREUM",
  "standard": "ERC_20",
  "derivationPath": "m/44'/60'/0'/0",
  "rpcUrl": "https://eth-rpc.url",
  "rpcUrlBackup": "https://eth-rpc-backup.url",
  "rpcUrlTestNet": "https://sepolia-rpc.url",
  "wsUrl": "https://eth-ws.url",
  "explorerUrl": "https://etherscan.io",
  "explorerUrlTestNet": "https://sepolia.etherscan.io",
  "confirmations": 12,
  "status": "ACTIVE"
}
```

**Network Types:**
- "ETHEREUM" | "ARBITRUM" | "BASE" | "OPTIMISM" | "POLYGON"
- "AVALANCHE" | "BINANCE_SMART_CHAIN" | "SOLANA" | "TRON"
- "BITCOIN" | "LIGHTNING" | "LITECOIN" | "XRP" | "DOGECOIN"

**Network Standards:**
- "ERC_20" | "SPL" | "TRC_20" | "NATIVE"
- "BITCOIN" | "LIGHTNING" | "LITECOIN" | "XRP" | "DOGECOIN"

**Response (201):** Created network object

**Purpose:** Add new blockchain network
**Notes:** Admin-only

---

### GET /networks
**Authentication:** JWT + Admin role

**Response (200):** All networks including inactive

**Purpose:** List all networks
**Notes:** Admin-only

---

### GET /networks/:id
**Authentication:** JWT + Admin role

**Response (200):** Full network configuration

**Purpose:** Get network details
**Notes:** Admin-only

---

### PATCH /networks/:id
**Authentication:** JWT + Admin role

**Request:** Same as POST (all fields optional)

**Response (200):** Updated network object

**Purpose:** Update network configuration
**Notes:** Admin-only

---

### DELETE /networks/:id
**Authentication:** JWT + Admin role

**Response (204):** No content

**Purpose:** Remove network from system
**Notes:** Admin-only; affects payment options

---

## 9. CURRENCY ROUTES

### GET /currencies
**Authentication:** None (public)

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 100)
- `status`: "ACTIVE" | "INACTIVE"
- `group`: boolean (default: false) - group by symbol and standard

**Response (200):**
```json
[
  {
    "id": "019b7624-5555-74be-9920-a19f77ba5675",
    "title": "Bitcoin",
    "symbol": "BTC",
    "type": "CRYPTOCURRENCY",
    "native": true,
    "decimals": 8,
    "status": "ACTIVE",
    "networks": [
      {
        "id": "019b7624-6666-74be-9920-a19f77ba5675",
        "name": "bitcoin",
        "title": "Bitcoin Network",
        "type": "BITCOIN",
        "standard": "BITCOIN",
        "enabled": true
      }
    ]
  },
  {
    "id": "019b7624-ffff-74be-9920-a19f77ba5675",
    "title": "US Dollar",
    "symbol": "USD",
    "type": "FIAT",
    "decimals": 2,
    "status": "ACTIVE"
  }
]
```

**Purpose:** Get all available currencies
**Notes:** Includes both fiat and crypto; public endpoint

---

### GET /rates
**Authentication:** None (public)

**Query Parameters:**
- `base`: string (e.g., "USD")
- `quote`: string (comma-separated, e.g., "BTC,ETH,USDT")
- `amount`: number (optional, calculates converted amounts)

**Response (200):**
```json
{
  "baseCurrency": "USD",
  "rates": [
    {
      "currency": "BTC",
      "rate": "0.000023",
      "source": "CoinGate",
      "amount": "0.0023"
    },
    {
      "currency": "ETH",
      "rate": "0.00034",
      "source": "CoinGate",
      "amount": "0.034"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Purpose:** Get current exchange rates
**Notes:**
- Public endpoint
- Rate limit: 200 requests/min (CoinGate API limit)
- Cached for 60 seconds
- Returns rates for conversion calculations

---

## 10. WEBHOOK ROUTES

### GET /stores/:storeId/webhooks
**Authentication:** API key required

**Headers:**
```json
{
  "sign": "SHA256 HMAC hash",
  "store": "019b7624-4444-74be-9920-a19f77ba5675"
}
```

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 20)
- `status`: "PENDING" | "DELIVERED" | "FAILED"
- `eventType`: "PENDING" | "PROCESSING" | "CONFIRMED" | "EXPIRED" | "CANCELLED"
- `invoiceId`: UUID (optional)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "019b7624-1111-74be-9920-a19f77ba5675",
      "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
      "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
      "eventType": "CONFIRMED",
      "endpointUrl": "https://merchant.com/webhook",
      "signature": "sha256_hash_of_payload",
      "statusCode": 200,
      "requestPayload": {
        "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
        "orderId": "ORD-99283",
        "status": "CONFIRMED",
        "amount": "100.50",
        "paidAmount": "0.054321",
        "currency": "USD",
        "paidCurrency": "ETH"
      },
      "responseBody": "OK",
      "errorMessage": null,
      "deliveredAt": "2024-01-01T00:20:00Z",
      "lastAttemptAt": "2024-01-01T00:20:00Z",
      "nextRetryAt": null,
      "attemptCount": 1,
      "maxRetries": 5,
      "lastError": null,
      "status": "DELIVERED",
      "createdAt": "2024-01-01T00:20:00Z",
      "updatedAt": "2024-01-01T00:20:00Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 100
  }
}
```

**Purpose:** List webhook events for store
**Notes:** Shows delivery status and retry information

---

### GET /stores/:storeId/webhooks/:eventId
**Authentication:** API key required

**Headers:**
```json
{
  "sign": "SHA256 HMAC hash",
  "store": "019b7624-4444-74be-9920-a19f77ba5675"
}
```

**Response (200):**
```json
{
  "id": "019b7624-1111-74be-9920-a19f77ba5675",
  "invoiceId": "019b7624-7777-74be-9920-a19f77ba5675",
  "storeId": "019b7624-4444-74be-9920-a19f77ba5675",
  "eventType": "CONFIRMED",
  "endpointUrl": "https://merchant.com/webhook",
  "signature": "sha256_hash_of_payload",
  "statusCode": 200,
  "requestPayload": {...},
  "responseBody": "OK",
  "errorMessage": null,
  "deliveredAt": "2024-01-01T00:20:00Z",
  "lastAttemptAt": "2024-01-01T00:20:00Z",
  "nextRetryAt": null,
  "attemptCount": 1,
  "maxRetries": 5,
  "lastError": null,
  "status": "DELIVERED",
  "createdAt": "2024-01-01T00:20:00Z",
  "updatedAt": "2024-01-01T00:20:00Z"
}
```

**Purpose:** Get webhook event details
**Notes:** Includes full request payload, response, and error information

---

### POST /stores/:storeId/webhooks/:eventId/retry
**Authentication:** API key required

**Headers:**
```json
{
  "sign": "SHA256 HMAC hash",
  "store": "019b7624-4444-74be-9920-a19f77ba5675"
}
```

**Response (200):**
```json
{
  "message": "Webhook retry queued successfully",
  "eventId": "019b7624-1111-74be-9920-a19f77ba5675"
}
```

**Purpose:** Manually retry webhook delivery
**Notes:** Re-queues failed webhook for immediate delivery

---

## COMMON ERROR RESPONSES

All endpoints may return these standard error responses:

### 400 Bad Request
**Invalid input or validation error**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
**Missing or invalid authentication**
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
**Insufficient permissions**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
**Resource not found**
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
**Unexpected server error**
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## PAYMENT STATUS FLOW

Invoice status transitions:

1. **PENDING** - Invoice created, awaiting payment
2. **PROCESSING** - Payment detected, awaiting confirmations
3. **CONFIRMED** - Payment confirmed (reaches required confirmations)
4. **EXPIRED** - Invoice expired before payment
5. **CANCELLED** - Invoice cancelled by merchant

**Webhook Notifications:**
- Sent for each status change
- Includes signature for verification
- Retry up to 5 times on failure
- Exponential backoff between retries

---

## BLOCKCHAIN CONFIRMATION REQUIREMENTS

Different networks require different confirmation counts:

- **Bitcoin:** 3 confirmations
- **Ethereum:** 12 confirmations
- **Polygon:** 120 confirmations
- **BSC:** 15 confirmations
- **Solana:** 32 confirmations
- **TRON:** 19 confirmations

Status changes from PROCESSING to CONFIRMED when required confirmations reached.

---

## PAGINATION STANDARD

All list endpoints support pagination:

**Query Parameters:**
- `skip`: number (offset, default: 0)
- `take` or `limit`: number (page size, default varies by endpoint)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 100
  }
}
```

Or:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## DATETIME FORMAT

All timestamps use ISO 8601 format:
- Example: `2024-01-01T00:00:00Z`
- Always in UTC timezone

---

## UUID FORMAT

All IDs use UUIDv7 format:
- Example: `019b7624-1060-74be-9920-a19f77ba5675`
- Sortable by creation time

---

## NOTES FOR FRONTEND INTEGRATION

1. **Authentication:**
   - Store JWT in HTTP-only cookie (automatic)
   - Include token in Authorization header for API calls
   - Refresh token before 7-day expiration

2. **API Keys:**
   - Only shown once at creation
   - Store securely (never in frontend code)
   - Use for server-side integrations only

3. **Invoice Creation:**
   - Lock exchange rates at creation time
   - Use `rates` array from response for display
   - Poll `/v1/invoice/:id/status` for updates (or use WebSocket)

4. **Payment Address:**
   - Generate only when user selects payment method
   - Display QR code for mobile wallets
   - Show timer for expiration countdown

5. **Webhook Verification:**
   - Verify signature on received webhooks
   - Use HMAC-SHA256 with API secret
   - Return 200 OK within 5 seconds

6. **Error Handling:**
   - Check `statusCode` for HTTP status
   - Display `message` to users
   - Log `errors` array for debugging

7. **Rate Limiting:**
   - Exchange rates endpoint: 200 req/min
   - Implement client-side caching (60 seconds)
   - Handle 429 Too Many Requests

---

## END OF DOCUMENTATION

This documentation covers all 50+ API endpoints across 11 feature modules in the crypto payment gateway backend. Each route includes complete authentication requirements, request/response schemas, and important notes for implementation.
