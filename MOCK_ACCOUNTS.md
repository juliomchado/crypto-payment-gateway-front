# 🔐 Mock Accounts for Testing

This file documents the available mock accounts for testing the application in development mode (`USE_MOCK=true`).

---

## 📋 Available Accounts

### 1. 👤 **Merchant Account** (Default)

**Credentials:**
```
Email: merchant@cryptogateway.com
Password: password
```

**Role:** `MERCHANT`

**Access:**
- ✅ Full dashboard access
- ✅ Stores management
- ✅ Invoice creation and management
- ✅ Wallets
- ✅ Webhooks
- ✅ API Keys
- ✅ Settings
- ❌ Admin panel (not accessible)

**Use this account to:**
- Test merchant workflows
- Create and manage stores
- Generate invoices and payment addresses
- View webhook events
- Manage API keys

---

### 2. 🛡️ **Admin Account**

**Credentials:**
```
Email: admin@cryptogateway.com
Password: admin123
```

**Role:** `ADMIN`

**Access:**
- ✅ Full dashboard access
- ✅ Stores management
- ✅ Invoice creation and management
- ✅ Wallets
- ✅ Webhooks
- ✅ API Keys
- ✅ Settings
- ✅ **Admin Panel** - User management

**Use this account to:**
- Test admin workflows
- Manage platform users
- Change user roles
- Delete users
- View system-wide data
- Test admin-only features

---

## 🚀 How to Use

1. **Make sure mock mode is enabled:**
   - Check that `.env.local` has `NEXT_PUBLIC_USE_MOCK=true`
   - Or it defaults to `true` in development

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

4. **Enter credentials:**
   - Use merchant account for standard merchant features
   - Use admin account to test admin panel and user management

---

## 🎭 Role Hierarchy

The application has three user roles:

### `USER` Role
- **Access:** Payment pages only (`/pay/[invoiceId]`)
- **Cannot access:** Dashboard or admin panel
- **Purpose:** End customers who make payments
- **No mock account** (users don't need to log in to pay)

### `MERCHANT` Role
- **Access:** Full dashboard
- **Cannot access:** Admin panel
- **Purpose:** Business owners who accept payments

### `ADMIN` Role
- **Access:** Full dashboard + Admin panel
- **Purpose:** Platform administrators

---

## 🔄 Switching Accounts

To test different roles:

1. **Logout** from current account (click logout button in sidebar)
2. **Login** with different credentials
3. The UI will automatically show/hide features based on role

**Example test flow:**
1. Login as **merchant** → Verify admin panel is NOT visible in sidebar
2. Logout → Login as **admin** → Verify admin panel IS visible in sidebar
3. Navigate to `/admin/users` → Verify you can see user list and manage roles

---

## 📊 Mock Data

When using mock accounts, you'll see:

- **6 sample invoices** with various statuses (CONFIRMED, PENDING, CONFIRMING, EXPIRED)
- **2 stores** (Demo Store, Second Store)
- **Multiple currencies** (USDT, USDC, ETH, BTC, SOL)
- **Wallet addresses** for different networks
- **Webhook events** with delivery status
- **API keys** for payment and payout

All mock data is defined in `src/models/mock-data.ts`

---

## ⚙️ Configuration

Mock mode is controlled by the `USE_MOCK` environment variable:

**In `.env.local`:**
```env
NEXT_PUBLIC_USE_MOCK=true  # Enable mock mode
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend URL (ignored in mock mode)
```

**To switch to real backend:**
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧪 Testing Scenarios

### Test Merchant Workflows
```
Account: merchant@cryptogateway.com
Scenarios:
- Create a new store
- Create an invoice
- Generate payment address
- View webhook events
- Rotate API keys
- Try to access /admin/users (should be blocked)
```

### Test Admin Features
```
Account: admin@cryptogateway.com
Scenarios:
- Access admin panel via sidebar
- View all users
- Change user roles (MERCHANT ↔ ADMIN)
- Delete users
- Access all merchant features
```

### Test Role Protection
```
1. Login as merchant
2. Try to access /admin/users directly (should redirect to /dashboard)
3. Verify "Admin Panel" is NOT in sidebar
4. Logout and login as admin
5. Verify "Admin Panel" IS in sidebar
6. Navigate to /admin/users (should work)
```

---

## 🔒 Security Notes

**⚠️ Mock Mode Security:**
- Mock credentials are **hardcoded** and should **NEVER** be used in production
- No actual authentication happens in mock mode
- All data is stored in browser localStorage
- Perfect for development and demos, **NOT for production**

**Production Security:**
- Set `NEXT_PUBLIC_USE_MOCK=false`
- Use real backend with JWT authentication
- Enable HTTP-only cookies
- Implement server-side middleware protection
- Never commit real credentials to git

---

## 🐛 Troubleshooting

**Issue:** "Invalid credentials" error
- **Solution:** Check spelling of email and password (case-sensitive)
- **Solution:** Verify mock mode is enabled (`USE_MOCK=true`)

**Issue:** Admin panel not visible after login
- **Solution:** Make sure you're using `admin@cryptogateway.com` (not merchant account)
- **Solution:** Check browser console for role verification
- **Solution:** Clear localStorage and login again

**Issue:** Redirect loop on login
- **Solution:** Clear browser localStorage
- **Solution:** Clear cookies
- **Solution:** Restart dev server

---

## 📝 Adding New Mock Users

To add more mock accounts, edit `src/models/mock-data.ts`:

```typescript
export const MOCK_NEW_USER: User = {
  id: 'unique-id',
  email: 'newuser@example.com',
  firstName: 'New',
  lastName: 'User',
  role: 'MERCHANT', // or 'ADMIN' or 'USER'
  status: 'EMAIL_VERIFIED',
  // ... other fields
}
```

Then update `src/services/auth.service.ts` login method:

```typescript
if (credentials.email === 'newuser@example.com' && credentials.password === 'password') {
  return { user: MOCK_NEW_USER }
}
```

---

**Last Updated:** January 2025
