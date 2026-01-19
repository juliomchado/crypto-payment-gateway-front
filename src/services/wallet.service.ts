import { api } from './api'
import type { Wallet, DerivedAddress, ApiResponse, ChainType, Address } from '@/models/types'

export interface CreateWalletData {
  merchantId: string
  chainType: ChainType
}

export const CHAIN_TYPE_NAMES: Record<ChainType, string> = {
  EVM: 'EVM (Ethereum, BSC, Polygon)',
  SOLANA: 'Solana',
  BITCOIN: 'Bitcoin'
}

class WalletService {
  async getWallets(merchantId?: string): Promise<Wallet[]> {
    // Endpoint as per API Reference (GET /wallets/merchant/:merchantId)
    const endpoint = merchantId ? `/wallets/merchant/${merchantId}` : '/wallets'
    // Backend returns { wallets } wrapper
    interface WalletListResponse {
      wallets: Wallet[]
    }
    const response = await api.get<WalletListResponse>(endpoint)
    return response.wallets
  }

  async getWallet(id: string): Promise<Wallet> {
    // Backend returns Wallet directly (not wrapped in ApiResponse)
    const response = await api.get<Wallet>(`/wallets/${id}`)
    return response
  }

  async createWallet(data: CreateWalletData): Promise<Wallet> {
    // Backend returns Wallet directly (not wrapped in ApiResponse)
    const response = await api.post<Wallet>('/wallets', data)
    return response
  }

  async deriveAddress(walletId: string, invoiceId: string): Promise<DerivedAddress> {
    // Backend requires invoiceId parameter to link address to invoice
    const response = await api.post<DerivedAddress>(
      `/wallets/${walletId}/derive`,
      { invoiceId }
    )
    return response
  }

  async getAddress(addressId: string): Promise<Address> {
    // Backend returns Address directly (not wrapped in ApiResponse)
    const response = await api.get<Address>(`/addresses/${addressId}`)
    return response
  }

  async lookupAddress(addressString: string): Promise<Address> {
    // Backend returns Address directly (not wrapped in ApiResponse)
    const response = await api.get<Address>(`/addresses/lookup/${addressString}`)
    return response
  }
}

export const walletService = new WalletService()
