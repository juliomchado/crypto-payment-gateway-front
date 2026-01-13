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
    const response = await api.get<ApiResponse<Wallet[]>>(endpoint)
    return response.data
  }

  async getWallet(id: string): Promise<Wallet> {
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${id}`)
    return response.data
  }

  async createWallet(data: CreateWalletData): Promise<Wallet> {
    const response = await api.post<ApiResponse<Wallet>>('/wallets', data)
    return response.data
  }

  async deriveAddress(walletId: string): Promise<DerivedAddress> {
    const response = await api.post<ApiResponse<DerivedAddress>>(`/wallets/${walletId}/derive`)
    return response.data
  }

  async getAddress(addressId: string): Promise<Address> {
    const response = await api.get<ApiResponse<Address>>(`/addresses/${addressId}`)
    return response.data
  }

  async lookupAddress(addressString: string): Promise<Address> {
    const response = await api.get<ApiResponse<Address>>(`/addresses/lookup/${addressString}`)
    return response.data
  }
}

export const walletService = new WalletService()
