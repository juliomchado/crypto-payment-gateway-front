import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_WALLETS, MOCK_MERCHANT } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Wallet, DerivedAddress, ApiResponse, ChainType } from '@/models/types'

export interface CreateWalletData {
  merchantId: string
  chainType: ChainType
}

// User-friendly names for chain types
export const CHAIN_TYPE_NAMES: Record<ChainType, string> = {
  EVM: 'EVM (Ethereum, BSC, Polygon)',
  SOLANA: 'Solana',
  BITCOIN: 'Bitcoin'
}

// Network to ChainType mapping
const NETWORK_TO_CHAIN_TYPE: Record<string, ChainType> = {
  'ethereum': 'EVM',
  'bsc': 'EVM',
  'polygon': 'EVM',
  'bitcoin': 'BITCOIN',
  'solana': 'SOLANA',
}

class WalletService {
  private mockWallets = [...MOCK_WALLETS]

  async getWallets(merchantId?: string): Promise<Wallet[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      if (merchantId) {
        return this.mockWallets.filter((w) => w.merchantId === merchantId)
      }
      return this.mockWallets.filter((w) => w.merchantId === MOCK_MERCHANT.id)
    }
    const endpoint = merchantId ? `/wallets/merchant/${merchantId}` : '/wallets'
    const response = await api.get<ApiResponse<Wallet[]>>(endpoint)
    return response.data
  }

  async getWallet(id: string): Promise<Wallet> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const wallet = this.mockWallets.find((w) => w.id === id)
      if (!wallet) {
        throw { message: 'Wallet not found', statusCode: 404 }
      }
      return wallet
    }
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${id}`)
    return response.data
  }

  async createWallet(data: CreateWalletData): Promise<Wallet> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const mockAddresses: Record<ChainType, string> = {
        EVM: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        BITCOIN: 'bc1q' + Math.random().toString(36).substring(2, 42),
        SOLANA: Array.from({ length: 44 }, () =>
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join(''),
      }

      const walletId = generateId()
      const newWallet: Wallet = {
        id: walletId,
        merchantId: data.merchantId,
        chainType: data.chainType,
        type: 'HOT',
        status: 'ACTIVE',
        publicKey: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        derivationPath: "m/44'/60'/0'",
        nextAddressIndex: 1,
        addresses: [{
          id: generateId(),
          address: mockAddresses[data.chainType],
          derivationIndex: 0,
          status: 'AVAILABLE',
          totalReceived: '0',
          totalWithdrawn: '0',
          masterWalletId: walletId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockWallets.push(newWallet)
      return newWallet
    }
    const response = await api.post<ApiResponse<Wallet>>('/wallets', data)
    return response.data
  }

  async deriveAddress(walletId: string): Promise<DerivedAddress> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const walletIndex = this.mockWallets.findIndex((w) => w.id === walletId)
      if (walletIndex === -1) {
        throw { message: 'Wallet not found', statusCode: 404 }
      }

      const wallet = this.mockWallets[walletIndex]
      const nextIndex = wallet.addresses ? wallet.addresses.length : 0
      const newAddress: DerivedAddress = {
        id: generateId(),
        walletId: walletId,
        address: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        index: nextIndex,
        isUsed: false,
        createdAt: new Date().toISOString(),
      }

      // Update wallet's nextAddressIndex
      this.mockWallets[walletIndex] = {
        ...wallet,
        nextAddressIndex: (wallet.nextAddressIndex || 0) + 1,
        updatedAt: new Date().toISOString(),
      }

      // Note: The full Address object would be created on the backend,
      // but we only return the DerivedAddress info to the client
      return newAddress
    }
    const response = await api.post<ApiResponse<DerivedAddress>>(`/wallets/${walletId}/derive`)
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const walletService = new WalletService()
