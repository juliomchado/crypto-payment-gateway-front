# 📋 Endpoints Faltando no Backend

Este documento especifica os endpoints que o **backend precisa implementar** para ter 100% de compatibilidade com o frontend.

---

## 🎯 1. Dashboard Statistics

### **GET /dashboard/stats**

Retorna estatísticas agregadas do dashboard do merchant.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:** Nenhum

**Response:** `200 OK`
```typescript
{
  "totalRevenue": 15234.56,        // Soma de todos invoices CONFIRMED (em USD ou moeda base)
  "revenueChange": 12.5,            // % de mudança comparado ao período anterior
  "totalInvoices": 847,             // Total de invoices criados
  "invoicesToday": 23,              // Invoices criados hoje
  "successRate": 94.2,              // % de invoices CONFIRMED vs total
  "activeStores": 3                 // Número de stores ACTIVE do merchant
}
```

**Lógica de Implementação:**
```sql
-- totalRevenue: Soma de todos invoices confirmados
SELECT COALESCE(SUM(amount), 0)
FROM invoices
WHERE store_id IN (SELECT id FROM stores WHERE merchant_id = :merchantId)
  AND payment_status = 'CONFIRMED'

-- revenueChange: Comparar últimos 30 dias vs 30 dias anteriores
-- Calcular (receita_atual - receita_anterior) / receita_anterior * 100

-- totalInvoices: Total de invoices
SELECT COUNT(*)
FROM invoices
WHERE store_id IN (SELECT id FROM stores WHERE merchant_id = :merchantId)

-- invoicesToday: Invoices criados hoje
SELECT COUNT(*)
FROM invoices
WHERE store_id IN (SELECT id FROM stores WHERE merchant_id = :merchantId)
  AND DATE(created_at) = CURRENT_DATE

-- successRate: Taxa de sucesso
SELECT (COUNT(*) FILTER (WHERE payment_status = 'CONFIRMED') * 100.0 / NULLIF(COUNT(*), 0))
FROM invoices
WHERE store_id IN (SELECT id FROM stores WHERE merchant_id = :merchantId)

-- activeStores: Stores ativas
SELECT COUNT(*)
FROM stores
WHERE merchant_id = :merchantId
  AND status = 'ACTIVE'
```

**Frontend Usage:**
- Arquivo: `src/services/dashboard.service.ts:12`
- Usado em: `src/app/(dashboard)/dashboard/page.tsx`
- Exibido em: Cards do dashboard principal

---

## 📊 2. Revenue Data

### **GET /dashboard/revenue**

Retorna dados de receita diária para gráficos.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `days` (number, opcional) - Número de dias para retornar. Default: `7`
  - Valores permitidos: 7, 14, 30, 60, 90

**Response:** `200 OK`
```typescript
{
  "data": [
    {
      "date": "2025-01-01",      // Data no formato YYYY-MM-DD
      "amount": 1234.56          // Receita total do dia (em USD ou moeda base)
    },
    {
      "date": "2025-01-02",
      "amount": 2345.67
    }
    // ... mais dias
  ]
}
```

**Lógica de Implementação:**
```sql
-- Gerar série de datas e fazer join com receita agregada
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL ':days days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date as date
)
SELECT
  ds.date::text as date,
  COALESCE(SUM(i.amount), 0) as amount
FROM date_series ds
LEFT JOIN invoices i ON DATE(i.created_at) = ds.date
  AND i.payment_status = 'CONFIRMED'
  AND i.store_id IN (
    SELECT id FROM stores WHERE merchant_id = :merchantId
  )
GROUP BY ds.date
ORDER BY ds.date ASC
```

**Frontend Usage:**
- Arquivo: `src/services/dashboard.service.ts:22`
- Usado em: `src/app/(dashboard)/dashboard/page.tsx`
- Exibido em: Gráfico de linha de receita (RevenueChart component)

---

## 🧾 3. Recent Invoices

### **GET /dashboard/invoices/recent**

Retorna os invoices mais recentes para visualização rápida no dashboard.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `limit` (number, opcional) - Número de invoices para retornar. Default: `5`
  - Valores permitidos: 1-50

**Response:** `200 OK`
```typescript
{
  "data": [
    {
      "id": "inv_abc123",
      "storeId": "store_xyz789",
      "amount": "100.00",                    // String (Decimal)
      "currency": "USD",
      "orderId": "ORDER-2025-001",
      "title": "Product Purchase",
      "description": "Premium subscription",
      "paymentStatus": "CONFIRMED",          // Enum PaymentStatus
      "payer_currency": "USDT",              // Token usado para pagamento
      "payer_amount": "100.000000",          // String (precisão total)
      "payment_amount": "100.000000",        // Quanto foi pago
      "paymentAddress": "0x742d35...",
      "networkId": "ethereum",
      "expiresAt": "2025-01-05T15:30:00Z",
      "createdAt": "2025-01-05T14:00:00Z",
      "updatedAt": "2025-01-05T14:15:00Z",

      // Campos opcionais
      "customerEmail": "customer@example.com",
      "rates": [                              // Exchange rates snapshot
        {
          "currencyId": "curr_usdt_eth",
          "networkId": "ethereum",
          "rate": "0.00058423",
          "payerAmount": "58.423000"
        }
      ]
    }
    // ... mais invoices
  ]
}
```

**Lógica de Implementação:**
```sql
SELECT
  i.id,
  i.store_id as "storeId",
  i.amount,
  i.currency,
  i.order_id as "orderId",
  i.title,
  i.description,
  i.payment_status as "paymentStatus",
  i.payer_currency,
  i.payer_amount,
  i.payment_amount,
  a.address as "paymentAddress",
  i.network_id as "networkId",
  i.expires_at as "expiresAt",
  i.created_at as "createdAt",
  i.updated_at as "updatedAt",
  i.customer_email as "customerEmail"
FROM invoices i
LEFT JOIN addresses a ON i.address_id = a.id
WHERE i.store_id IN (
  SELECT id FROM stores WHERE merchant_id = :merchantId
)
ORDER BY i.created_at DESC
LIMIT :limit
```

**Incluir Rates (opcional):**
```sql
-- Para cada invoice, buscar os exchange rates
SELECT
  currency_id as "currencyId",
  network_id as "networkId",
  rate,
  payer_amount as "payerAmount"
FROM invoice_exchange_rates
WHERE invoice_id = :invoiceId
```

**Frontend Usage:**
- Arquivo: `src/services/dashboard.service.ts:33`
- Usado em: `src/app/(dashboard)/dashboard/page.tsx`
- Exibido em: Tabela "Recent Invoices" no dashboard

---

## 📜 4. Invoice List (Merchant View)

### **GET /v1/invoice**

Lista todos os invoices do merchant com filtros e paginação.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `storeId` (string, opcional) - Filtrar por store específica
- `status` (PaymentStatus, opcional) - Filtrar por status
  - Valores: PENDING, DETECTING, CONFIRMING, CONFIRMED, OVERPAID, UNDERPAID, EXPIRED, FAILED, REFUNDING, REFUNDED, CANCELLED
- `startDate` (string ISO 8601, opcional) - Data inicial (inclusive)
- `endDate` (string ISO 8601, opcional) - Data final (inclusive)
- `page` (number, opcional) - Página atual. Default: `1`
- `limit` (number, opcional) - Itens por página. Default: `10`
  - Valores permitidos: 1-100

**Response:** `200 OK`
```typescript
{
  "data": [
    {
      // Mesma estrutura do Invoice completo (ver acima)
      "id": "inv_abc123",
      "storeId": "store_xyz789",
      "amount": "100.00",
      // ... todos os campos
    }
  ],
  "total": 847,           // Total de invoices que correspondem aos filtros
  "page": 1,              // Página atual
  "limit": 10,            // Itens por página
  "totalPages": 85        // Total de páginas
}
```

**Lógica de Implementação:**
```sql
-- Query principal com filtros
SELECT
  i.id,
  i.store_id as "storeId",
  i.amount,
  i.currency,
  i.order_id as "orderId",
  i.title,
  i.description,
  i.payment_status as "paymentStatus",
  i.payer_currency,
  i.payer_amount,
  i.payment_amount,
  i.payment_amount_fiat as "payment_amount_fiat",
  i.merchant_amount as "merchantAmount",
  i.merchant_currency as "merchantCurrency",
  a.address as "paymentAddress",
  i.network_id as "networkId",
  i.expires_at as "expiresAt",
  i.created_at as "createdAt",
  i.updated_at as "updatedAt",
  i.customer_email as "customerEmail",
  i.url_callback as "urlCallback",
  i.url_return as "urlReturn",
  i.url_success as "urlSuccess"
FROM invoices i
LEFT JOIN addresses a ON i.address_id = a.id
WHERE i.store_id IN (
  SELECT id FROM stores WHERE merchant_id = :merchantId
)
  -- Aplicar filtros condicionalmente
  AND (:storeId IS NULL OR i.store_id = :storeId)
  AND (:status IS NULL OR i.payment_status = :status)
  AND (:startDate IS NULL OR i.created_at >= :startDate)
  AND (:endDate IS NULL OR i.created_at <= :endDate)
ORDER BY i.created_at DESC
LIMIT :limit
OFFSET (:page - 1) * :limit

-- Query para contar total
SELECT COUNT(*) as total
FROM invoices i
WHERE i.store_id IN (
  SELECT id FROM stores WHERE merchant_id = :merchantId
)
  AND (:storeId IS NULL OR i.store_id = :storeId)
  AND (:status IS NULL OR i.payment_status = :status)
  AND (:startDate IS NULL OR i.created_at >= :startDate)
  AND (:endDate IS NULL OR i.created_at <= :endDate)
```

**Frontend Usage:**
- Arquivo: `src/services/invoice.service.ts:97`
- Usado em: `src/app/(dashboard)/dashboard/invoices/page.tsx`
- Exibido em: Tabela de invoices com paginação e filtros

---

## 🔐 Autenticação e Autorização

**Todos os endpoints acima requerem:**

1. **JWT Authentication:**
   - Header: `Authorization: Bearer {token}`
   - Token deve conter `merchantId` ou `userId`

2. **Merchant Scope:**
   - Usuário deve ter role `MERCHANT` ou `ADMIN`
   - Dados filtrados por `merchantId` do usuário autenticado
   - ADMIN pode ver dados de qualquer merchant (adicionar query param `merchantId`)

3. **Store Ownership:**
   - Validar que stores pertencem ao merchant autenticado
   - Evitar acesso a dados de outros merchants

**Exemplo de verificação:**
```typescript
// No controller
const merchantId = request.user.merchantId // Do JWT
const storeId = request.query.storeId

if (storeId) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { merchantId: true }
  })

  if (!store || store.merchantId !== merchantId) {
    throw new ForbiddenError('Access denied to this store')
  }
}
```

---

## 📊 Agregações e Performance

### **Otimizações Recomendadas:**

1. **Índices no Banco:**
```sql
-- Invoice queries
CREATE INDEX idx_invoices_store_created ON invoices(store_id, created_at DESC);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_created_date ON invoices(created_at);

-- Store queries
CREATE INDEX idx_stores_merchant_status ON stores(merchant_id, status);
```

2. **Caching:**
- Cache dashboard stats por 5 minutos (invalidar em novos invoices)
- Cache revenue data por 1 hora (dados históricos não mudam)
- Recent invoices: cache de 30 segundos

3. **Agregações em Background:**
- Calcular stats periodicamente e salvar em tabela separada
- Usar MATERIALIZED VIEW para queries pesadas

---

## 🧪 Exemplos de Requisições

### Dashboard Stats
```bash
curl -X GET "https://api.example.com/dashboard/stats" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Revenue Data (últimos 30 dias)
```bash
curl -X GET "https://api.example.com/dashboard/revenue?days=30" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Recent Invoices (últimos 10)
```bash
curl -X GET "https://api.example.com/dashboard/invoices/recent?limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Invoice List (filtrado)
```bash
curl -X GET "https://api.example.com/v1/invoice?storeId=store_xyz&status=CONFIRMED&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## ✅ Checklist de Implementação

- [ ] **GET /dashboard/stats** - Estatísticas agregadas
- [ ] **GET /dashboard/revenue** - Dados de receita diária
- [ ] **GET /dashboard/invoices/recent** - Invoices recentes
- [ ] **GET /v1/invoice** - Lista de invoices com paginação
- [ ] Adicionar índices de banco de dados
- [ ] Implementar autenticação JWT nos endpoints
- [ ] Validar merchant ownership de stores
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Documentar no Swagger/OpenAPI
- [ ] Implementar rate limiting
- [ ] Adicionar logging e monitoring

---

## 📝 Notas Adicionais

### Formato de Decimals
O Prisma usa `Decimal` para precisão financeira. Ao retornar na API:
```typescript
// Converter Decimal para string
amount: invoice.amount.toString()
```

### Timezone
- Todas as datas devem estar em UTC (ISO 8601)
- Frontend faz conversão para timezone local
- Exemplo: `"2025-01-05T14:30:00.000Z"`

### Status Enum
Garantir que o backend retorna os mesmos valores de enum que o frontend espera:
```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  DETECTING = "DETECTING",
  CONFIRMING = "CONFIRMING",
  CONFIRMED = "CONFIRMED",
  OVERPAID = "OVERPAID",
  UNDERPAID = "UNDERPAID",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",
  REFUNDING = "REFUNDING",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED"
}
```

### Error Responses
Seguir formato padrão do backend:
```typescript
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid query parameter: days must be between 1 and 90"
}
```
