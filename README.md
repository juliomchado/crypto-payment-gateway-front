# MangoPay - Frontend

A premium cryptocurrency payment gateway frontend built with Next.js 14, TypeScript, and Tailwind CSS. Accept crypto payments with a beautiful, modern interface inspired by leading platforms like Apple, Netflix, Spotify, and Cryptomus.

## Features

- **Authentication System**: Login, register, password recovery
- **Dashboard**: Real-time statistics, revenue charts, recent invoices
- **Store Management**: CRUD operations, multi-store support
- **Currency Configuration**: Configure accepted cryptocurrencies per store
- **Invoice Management**: Create, track, and manage payment invoices
- **Wallet Management**: View and manage cryptocurrency wallets
- **API Keys**: Generate and manage API keys with granular permissions
- **Public Payment Page**: Customer-facing payment interface with QR codes
- **Settings**: Profile and security management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand (MVVM pattern)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **QR Codes**: qrcode.react

## Architecture

The project follows the **MVVM (Model-View-ViewModel)** pattern:

```
src/
├── app/                    # Next.js App Router (Views)
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── (public)/          # Public payment pages
├── components/            # Reusable UI Components (Views)
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth-specific components
│   ├── dashboard/        # Dashboard components
│   ├── stores/           # Store management components
│   ├── invoices/         # Invoice components
│   ├── wallets/          # Wallet components
│   ├── api-keys/         # API key components
│   ├── payment/          # Public payment components
│   └── settings/         # Settings components
├── viewmodels/            # ViewModels (Business Logic + State)
├── models/                # Data Models & Types
├── services/              # API Services
├── lib/                   # Utilities
└── hooks/                 # Custom Hooks
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/juliomchado/crypto-payment-gateway-front.git
cd crypto-payment-gateway-front
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=true
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mock Mode

The application includes a comprehensive mock system for development without a backend:

- **Mock Data**: Realistic sample data for all entities
- **Mock Services**: Simulated API calls with delays
- **Demo Credentials**:
  - Email: `demo@MangoPay.com`
  - Password: `password`

To toggle mock mode, set `NEXT_PUBLIC_USE_MOCK` in `.env.local`:
- `true`: Use mock data (default for development)
- `false`: Connect to real API

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Design System

### Color Palette

```css
Primary: #10B981 (Green)
Background: #FFFFFF (White)
Surface: #F9FAFB, #F3F4F6
Text: #111827, #374151
Border: #E5E7EB
Success: #22C55E
Error: #EF4444
Warning: #F59E0B
```

### Typography

- **Font**: Inter
- **Titles**: Bold, tight tracking
- **Body**: Regular/Medium

### Components

- Rounded corners (rounded-xl, rounded-2xl)
- Subtle shadows (shadow-sm, shadow-md)
- Smooth transitions (duration-200)
- Hover and focus states

## Key Pages

### Dashboard (`/dashboard`)
- Revenue statistics
- Invoice charts
- Recent activity
- Quick actions

### Stores (`/dashboard/stores`)
- Store list and management
- Currency configuration
- Store details and settings

### Invoices (`/dashboard/invoices`)
- Invoice list with filters
- Invoice details
- Status tracking

### Wallets (`/dashboard/wallets`)
- Wallet overview
- Balance tracking
- Address management

### API Keys (`/dashboard/api-keys`)
- Key generation
- Permission management
- Revocation

### Public Payment (`/pay/[invoiceId]`)
- Currency selection
- QR code display
- Payment tracking
- Status updates

## Known Limitations

### Non-EVM Payment Networks (Bitcoin, Solana)
- **Status**: Backend fix in progress
- **Impact**: Only EVM networks (Ethereum, BSC, Polygon) are fully functional for payments
- **Reason**: Backend has hardcoded chain type in `get-payment-address.controller.ts:24`
- **Workaround**: Frontend displays warning when non-EVM networks are selected
- **Timeline**: Will be resolved in upcoming backend update

### Network Standards Migration
The frontend has been updated to use the new `NetworkStandard` enum values from the backend:
- `EVM` → `ERC_20` (Ethereum, BSC, Polygon, etc.)
- `SOLANA` → `SPL` (Solana)
- `BITCOIN` → `BITCOIN` (unchanged)

This ensures full compatibility with the latest backend API.

## API Integration

The application is designed to work with the MangoPay API. When `USE_MOCK=false`, it connects to the backend API.

### API Endpoints

```typescript
// Auth
POST /auth/login
POST /auth/register
POST /auth/logout

// Stores
GET  /stores
POST /stores
GET  /stores/:id
PATCH /stores/:id

// Invoices
GET  /invoices
POST /v1/invoice
GET  /v1/invoice/:id
POST /v1/invoice/:id/address

// Wallets
GET  /wallets
POST /wallets
GET  /wallets/:id

// API Keys
GET  /stores/:storeId/api-keys
POST /stores/:storeId/api-keys
PATCH /api-keys/:id/revoke
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows Conventional Commits:

- `feat:` New features
- `fix:` Bug fixes
- `chore:` Maintenance tasks
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
